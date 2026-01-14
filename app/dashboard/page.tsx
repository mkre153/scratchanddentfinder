/**
 * Dashboard Overview Page
 *
 * Shows user's stores and basic management options.
 * Slice 13: Stripe Integration
 */

import { createAuthClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getStoresByUserId } from '@/lib/queries'
import { getDashboardBillingUrl, getAdvertiseUrl } from '@/lib/urls'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = await createAuthClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // User is guaranteed to exist (layout checks auth)
  const stores = await getStoresByUserId(user!.id)

  return (
    <div>
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
