/**
 * Dashboard Overview Page
 *
 * Shows user's stores and basic management options.
 * Slice 13: Stripe Integration
 */

import { createAuthClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getStoresByUserId, getClaimsByUserId } from '@/lib/queries'
import { getDashboardBillingUrl, getAdvertiseUrl } from '@/lib/urls'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = await createAuthClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // User is guaranteed to exist (layout checks auth)
  const stores = await getStoresByUserId(user!.id)
  const claims = await getClaimsByUserId(user!.id)

  // Filter to show only pending claims (approved claims become stores via trigger)
  const pendingClaims = claims.filter(c => c.status === 'pending')

  return (
    <div>
      {/* Pending Claims Section */}
      {pendingClaims.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900">Pending Claims</h2>
          <p className="mt-1 text-sm text-gray-600">
            These claims are being reviewed by our team.
          </p>
          <div className="mt-4 space-y-3">
            {pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{claim.storeName}</p>
                  <p className="text-sm text-gray-600">{claim.storeAddress}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pending Review
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900">Your Stores</h2>

      {stores.length === 0 ? (
        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">No stores yet</h3>
          <p className="mt-2 text-gray-600">
            You haven&apos;t claimed any stores yet. Claim a store to manage its
            listing and upgrade to featured.
          </p>
          <Link
            href={getAdvertiseUrl()}
            className="mt-6 inline-block rounded-md bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Learn About Featured Listings
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {store.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{store.address}</p>
                </div>
                <div className="text-right">
                  {store.featuredTier ? (
                    <div>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                        {store.featuredTier === 'annual'
                          ? 'Annual Plan'
                          : 'Monthly Plan'}
                      </span>
                      {store.featuredUntil && (
                        <p className="mt-1 text-xs text-gray-500">
                          Until{' '}
                          {new Date(store.featuredUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                      Free Listing
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                {!store.featuredTier && (
                  <Link
                    href={getAdvertiseUrl()}
                    className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    Upgrade to Featured
                  </Link>
                )}
                <Link
                  href={getDashboardBillingUrl()}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Manage Billing
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
