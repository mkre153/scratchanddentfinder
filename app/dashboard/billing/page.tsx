/**
 * Dashboard Billing Page
 *
 * Billing UI with subscription status:
 * 1. Current plan status (tier + status badge + featured_until)
 * 2. Past due warning with update payment CTA
 * 3. "Manage Billing" button → Stripe Customer Portal
 *
 * Slice 13: Stripe Integration
 * Enhanced: Stripe Hardening - status display and warnings
 */

import { createAuthClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import Link from 'next/link'
import {
  getStoresByUserId,
  getStripeCustomerId,
  getSubscriptionsByUserId,
} from '@/lib/queries'
import { getAdvertiseUrl, getBillingPortalApiUrl } from '@/lib/urls'
import { BillingPortalButton } from './BillingPortalButton'

// Status badge component
function StatusBadge({
  status,
}: {
  status: 'active' | 'past_due' | 'canceled' | 'incomplete'
}) {
  const styles = {
    active: 'bg-green-100 text-green-800',
    past_due: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
    incomplete: 'bg-yellow-100 text-yellow-800',
  }

  const labels = {
    active: 'Active',
    past_due: 'Past Due',
    canceled: 'Canceled',
    incomplete: 'Incomplete',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

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

  // Get user's stores, subscriptions, and Stripe customer status
  const [stores, subscriptions, stripeCustomerId] = await Promise.all([
    getStoresByUserId(user!.id),
    getSubscriptionsByUserId(user!.id),
    getStripeCustomerId(user!.id),
  ])

  // Create a map of store subscriptions for quick lookup
  const subscriptionByStoreId = new Map(
    subscriptions.map((sub) => [sub.storeId, sub])
  )

  // Find stores with featured tier (from store data) and merge with subscription status
  const featuredStores = stores
    .filter((s) => s.featuredTier)
    .map((store) => ({
      ...store,
      subscription: subscriptionByStoreId.get(store.id),
    }))

  const hasActiveSubscription = featuredStores.length > 0

  // Check if any subscription is past_due
  const hasPastDueSubscription = subscriptions.some(
    (sub) => sub.status === 'past_due'
  )

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Billing</h2>

      {/* Past Due Warning Banner */}
      {hasPastDueSubscription && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Payment Failed
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Your payment method was declined. Please update your payment
                information to keep your featured listing active.
              </p>
              {stripeCustomerId && (
                <div className="mt-3">
                  <BillingPortalButton
                    apiUrl={getBillingPortalApiUrl()}
                    variant="danger"
                    label="Update Payment Method"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                  <StatusBadge
                    status={store.subscription?.status ?? 'active'}
                  />
                  {store.featuredUntil && (
                    <p className="mt-1 text-xs text-gray-500">
                      {store.subscription?.status === 'canceled'
                        ? 'Expires'
                        : 'Renews'}{' '}
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
      {stripeCustomerId && !hasPastDueSubscription && (
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
          <div>
            <p className="mt-2 text-gray-600">
              Manage your payment methods, view invoices, and update billing
              details through the Stripe Customer Portal.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Customer ID: {stripeCustomerId}
            </p>
          </div>
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
