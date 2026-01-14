/**
 * Dashboard Billing Page
 *
 * Minimal MVP billing UI:
 * 1. Current plan status (tier + featured_until)
 * 2. "Manage Billing" button → Stripe Customer Portal
 *
 * Slice 13: Stripe Integration
 *
 * Deferred to Slice 13.5:
 * - Invoice history display
 * - Multi-store subscription management
 * - In-app upgrade/downgrade UI
 */

import { createAuthClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getStoresByUserId, getStripeCustomerId } from '@/lib/queries'
import { getAdvertiseUrl, getBillingPortalApiUrl } from '@/lib/urls'
import { BillingPortalButton } from './BillingPortalButton'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string }
}) {
  const cookieStore = await cookies()
  const supabase = await createAuthClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's stores and Stripe customer status
  const [stores, stripeCustomerId] = await Promise.all([
    getStoresByUserId(user!.id),
    getStripeCustomerId(user!.id),
  ])

  // Find stores with active subscriptions
  const featuredStores = stores.filter((s) => s.featuredTier)
  const hasActiveSubscription = featuredStores.length > 0

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Billing</h2>

      {/* Success/Cancel messages from Stripe redirect */}
      {searchParams.success && (
        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-green-800">
            ✓ Payment successful! Your featured listing is now active.
          </p>
        </div>
      )}
      {searchParams.canceled && (
        <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-yellow-800">
            Payment was canceled. No charges were made.
          </p>
        </div>
      )}

      {/* Current Plan Section */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>

        {hasActiveSubscription ? (
          <div className="mt-4 space-y-4">
            {featuredStores.map((store) => (
              <div
                key={store.id}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{store.name}</p>
                  <p className="text-sm text-gray-600">
                    {store.featuredTier === 'annual'
                      ? 'Annual Plan ($290/year)'
                      : 'Monthly Plan ($29/month)'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    Active
                  </span>
                  {store.featuredUntil && (
                    <p className="mt-1 text-xs text-gray-500">
                      Renews{' '}
                      {new Date(store.featuredUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-gray-600">
              You don&apos;t have any active subscriptions.
            </p>
            <Link
              href={getAdvertiseUrl()}
              className="mt-4 inline-block rounded-md bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Upgrade to Featured
            </Link>
          </div>
        )}
      </div>

      {/* Manage Billing Button (Stripe Customer Portal) */}
      {stripeCustomerId && (
        <div className="mt-6">
          <BillingPortalButton apiUrl={getBillingPortalApiUrl()} />
        </div>
      )}

      {/* Payment Info Section */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">
          Payment Information
        </h3>
        {stripeCustomerId ? (
          <p className="mt-2 text-gray-600">
            Manage your payment methods, view invoices, and update billing
            details through the Stripe Customer Portal above.
          </p>
        ) : (
          <p className="mt-2 text-gray-600">
            No payment methods on file. Subscribe to a featured listing to add a
            payment method.
          </p>
        )}
      </div>
    </div>
  )
}
