/**
 * Checkout API Route
 *
 * Creates Stripe Checkout session for featured listing subscriptions.
 * Slice 13: Stripe Integration
 *
 * POST /api/checkout
 * Body: { storeId: number, tier: 'monthly' | 'annual' }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getStripe, PRICES, getBaseUrl } from '@/lib/stripe'
import type { PriceTier } from '@/lib/stripe'
import {
  getStoreById,
  getStripeCustomerId,
  saveStripeCustomerId,
} from '@/lib/queries'
import { getDashboardBillingUrl } from '@/lib/urls'
import { createAuthClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  // Initialize Stripe client once for this handler
  const stripe = getStripe()

  try {
    // 1. Get authenticated user
    const cookieStore = await cookies()
    const supabase = await createAuthClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const { storeId, tier } = body as { storeId: number; tier: PriceTier }

    if (!storeId || !tier) {
      return NextResponse.json(
        { error: 'storeId and tier are required' },
        { status: 400 }
      )
    }

    if (!['monthly', 'annual'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be monthly or annual.' },
        { status: 400 }
      )
    }

    // 3. Validate store exists and user can purchase for it
    const store = await getStoreById(storeId)
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // User must either own the store (claimed_by) or store must be unclaimed
    const canPurchase =
      store.claimedBy === user.id || store.claimedBy === null
    if (!canPurchase) {
      return NextResponse.json(
        { error: 'You do not have permission to purchase for this store' },
        { status: 403 }
      )
    }

    // 4. Get or create Stripe customer
    let stripeCustomerId = await getStripeCustomerId(user.id)

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })
      stripeCustomerId = customer.id
      await saveStripeCustomerId(user.id, stripeCustomerId)
    }

    // 5. Create Checkout Session
    const baseUrl = getBaseUrl()
    const billingUrl = `${baseUrl}${getDashboardBillingUrl()}`

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription', // Always subscription, no one-time payments
      line_items: [
        {
          price: PRICES[tier],
          quantity: 1,
        },
      ],
      metadata: {
        storeId: storeId.toString(),
        userId: user.id,
        tier,
      },
      subscription_data: {
        metadata: {
          storeId: storeId.toString(),
          userId: user.id,
          tier,
        },
      },
      success_url: `${billingUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${billingUrl}?canceled=true`,
    })

    // 6. Return checkout URL
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
