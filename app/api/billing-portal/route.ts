/**
 * Billing Portal API Route
 *
 * Creates a Stripe Customer Portal session for self-service subscription management.
 * Slice 13: Stripe Integration
 *
 * POST /api/billing-portal
 *
 * The Stripe Customer Portal handles:
 * - View/update payment methods
 * - View/download invoices
 * - Cancel subscription
 * - View subscription details
 */

import { NextRequest, NextResponse } from 'next/server'
import { getStripe, getBaseUrl } from '@/lib/stripe'
import { getStripeCustomerId } from '@/lib/queries'
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

    // 2. Get user's Stripe customer ID
    const stripeCustomerId = await getStripeCustomerId(user.id)

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 404 }
      )
    }

    // 3. Create Billing Portal session
    const baseUrl = getBaseUrl()
    const returnUrl = `${baseUrl}${getDashboardBillingUrl()}`

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    })

    // 4. Return portal URL
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
