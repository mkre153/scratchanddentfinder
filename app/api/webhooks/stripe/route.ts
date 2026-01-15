/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events with strict separation of concerns.
 * Slice 13: Stripe Integration
 *
 * POST /api/webhooks/stripe
 *
 * ARCHITECTURAL INVARIANTS:
 * 1. checkout.session.completed → sets store tier ONLY (never creates subscription)
 * 2. customer.subscription.* → manages subscription record ONLY (never touches tier)
 * 3. customer.subscription.deleted → sets status to 'canceled' (never clears tier)
 * 4. is_featured is NEVER touched by webhooks - requires admin quality gate
 */

import { NextRequest, NextResponse } from 'next/server'
import { getStripe, calculateFeaturedUntil } from '@/lib/stripe'
import type { PriceTier } from '@/lib/stripe'
import {
  setStoreTierFromCheckout,
  syncSubscription,
  updateSubscriptionStatus,
  updateStoreFeaturedUntil,
  getWebhookEvent,
  recordWebhookEvent,
} from '@/lib/queries'
import { syncStripePurchase } from '@/lib/ghl'
import Stripe from 'stripe'

// Disable body parsing - we need the raw body for signature verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Initialize Stripe client once for this handler
  const stripe = getStripe()

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  // 1. Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // 2. Check idempotency - skip if already processed
  const existingEvent = await getWebhookEvent(event.id)
  if (existingEvent) {
    console.log(`Webhook event ${event.id} already processed, skipping`)
    return NextResponse.json({ received: true })
  }

  // 3. Handle event based on type
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // 4. Record event as processed (idempotency)
    await recordWebhookEvent(event.id, event.type)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// =============================================================================
// Event Handlers (Strict Separation of Concerns)
// =============================================================================

/**
 * Handle checkout.session.completed
 *
 * RESPONSIBILITY: Set store tier ONLY
 * DOES NOT: Create subscription record (that happens in subscription.created)
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id)

  // Extract metadata
  const storeId = session.metadata?.storeId
  const tier = session.metadata?.tier as PriceTier | undefined

  if (!storeId || !tier) {
    console.error('Missing storeId or tier in session metadata')
    return
  }

  const storeIdNum = parseInt(storeId, 10)
  if (isNaN(storeIdNum)) {
    console.error('Invalid storeId in session metadata:', storeId)
    return
  }

  // Calculate featured_until based on tier
  const featuredUntil = calculateFeaturedUntil(tier)

  // Set store tier (ONLY action from checkout event)
  await setStoreTierFromCheckout(storeIdNum, tier, featuredUntil)

  console.log(`Store ${storeIdNum} tier set to ${tier} until ${featuredUntil.toISOString()}`)

  // Sync to GoHighLevel (non-blocking - errors logged but don't fail the webhook)
  const customerEmail = session.customer_email || session.customer_details?.email
  if (customerEmail) {
    syncStripePurchase({
      email: customerEmail,
      tier: tier,
    }).catch((err) => console.error('[GHL] Stripe purchase sync failed:', err))
  }
}

/**
 * Handle customer.subscription.created
 *
 * RESPONSIBILITY: Create subscription record ONLY
 * DOES NOT: Touch store tier (that's handled by checkout event)
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.created:', subscription.id)

  // Extract metadata from subscription
  const storeId = subscription.metadata?.storeId
  const userId = subscription.metadata?.userId
  const tier = subscription.metadata?.tier as PriceTier | undefined

  if (!storeId || !userId || !tier) {
    console.error('Missing metadata in subscription:', subscription.metadata)
    return
  }

  const storeIdNum = parseInt(storeId, 10)
  if (isNaN(storeIdNum)) {
    console.error('Invalid storeId in subscription metadata:', storeId)
    return
  }

  // Create/update subscription record (ONLY action from subscription events)
  // Note: current_period_end is a Unix timestamp
  const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end
  await syncSubscription({
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    storeId: storeIdNum,
    userId,
    tier,
    status: subscription.status,
    currentPeriodEnd: new Date(periodEnd * 1000),
  })

  console.log(`Subscription ${subscription.id} created for store ${storeIdNum}`)
}

/**
 * Handle customer.subscription.updated
 *
 * RESPONSIBILITY: Update subscription record AND extend featured_until on renewal
 *
 * CRITICAL FIX: When subscription auto-renews (status='active'), we must extend
 * featured_until to match the new period end. Without this, stores lose featured
 * status mid-subscription because featured_until was only set at initial checkout.
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.updated:', subscription.id)

  const storeId = subscription.metadata?.storeId
  const userId = subscription.metadata?.userId
  const tier = subscription.metadata?.tier as PriceTier | undefined

  if (!storeId || !userId || !tier) {
    // Subscription might have been created outside our flow - update status only
    console.log('Missing metadata, updating status only')
    await updateSubscriptionStatus(subscription.id, subscription.status)
    return
  }

  const storeIdNum = parseInt(storeId, 10)
  if (isNaN(storeIdNum)) {
    await updateSubscriptionStatus(subscription.id, subscription.status)
    return
  }

  // Note: current_period_end is a Unix timestamp
  const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end
  const newPeriodEndDate = new Date(periodEnd * 1000)

  // Update subscription record (sync all fields)
  await syncSubscription({
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    storeId: storeIdNum,
    userId,
    tier,
    status: subscription.status,
    currentPeriodEnd: newPeriodEndDate,
  })

  // CRITICAL: Extend featured_until when subscription is active (renewal scenario)
  // This ensures the store stays featured as long as subscription is paid
  if (subscription.status === 'active') {
    await updateStoreFeaturedUntil(storeIdNum, newPeriodEndDate)
    console.log(`Store ${storeIdNum} featured_until extended to ${newPeriodEndDate.toISOString()}`)
  }

  console.log(`Subscription ${subscription.id} updated, status: ${subscription.status}`)
}

/**
 * Handle customer.subscription.deleted
 *
 * RESPONSIBILITY: Mark subscription as 'canceled' ONLY
 * DOES NOT: Clear store tier - let featured_until govern expiration
 *
 * This is a critical architectural decision:
 * - User paid for tier until featured_until date
 * - Canceling subscription doesn't forfeit remaining time
 * - Tier expires naturally when featured_until passes
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.deleted:', subscription.id)

  // Update status to 'canceled' (ONLY action - NEVER clear tier)
  await updateSubscriptionStatus(subscription.id, 'canceled')

  console.log(`Subscription ${subscription.id} marked as canceled (tier NOT cleared)`)
}

/**
 * Handle invoice.payment_failed
 *
 * RESPONSIBILITY: Mark subscription as 'past_due' ONLY
 * DOES NOT: Touch store tier
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_failed:', invoice.id)

  // Note: subscription can be string, Subscription object, or null
  const invoiceData = invoice as unknown as { subscription: string | null }
  const subscriptionId = invoiceData.subscription
  if (!subscriptionId) {
    console.log('No subscription associated with invoice')
    return
  }

  // Update subscription status to past_due
  await updateSubscriptionStatus(subscriptionId, 'past_due')

  console.log(`Subscription ${subscriptionId} marked as past_due`)
}
