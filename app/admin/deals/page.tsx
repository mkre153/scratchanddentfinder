/**
 * Admin Flagged Deals Review Page
 *
 * Shows flagged deals for admin approval/rejection.
 */

export const dynamic = 'force-dynamic'

import { requireAdmin } from '@/lib/admin-auth'
import { getFlaggedDeals } from '@/lib/queries'
import { AdminDealActions } from './actions'

function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default async function AdminDealsPage() {
  const { isAuthorized } = await requireAdmin()

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Authorized</h1>
          <p className="text-gray-600">You must be an admin to access this page.</p>
        </div>
      </div>
    )
  }

  const deals = await getFlaggedDeals()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Flagged Deals</h1>
        <p className="text-gray-600 mb-8">
          {deals.length} deal{deals.length !== 1 ? 's' : ''} pending review
        </p>

        {deals.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow">
            <p className="text-gray-500">No flagged deals to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{deal.title}</h2>
                    <p className="text-sm text-gray-500">
                      by {deal.submitterName} ({deal.submitterEmail})
                    </p>
                    <p className="text-sm text-gray-500">
                      {deal.city}, {deal.state} | {formatPrice(deal.dealPrice)}
                      {deal.originalPrice ? ` (was ${formatPrice(deal.originalPrice)})` : ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    Flagged
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-sm text-gray-700">
                    <strong>Damage:</strong> {deal.damageDescription}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    <strong>Description:</strong> {deal.description}
                  </p>
                </div>

                {deal.photoPaths.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {deal.photoPaths.map((path, i) => (
                      <img
                        key={i}
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/deal-photos/${path}`}
                        alt={`Photo ${i + 1}`}
                        className="h-20 w-20 rounded object-cover flex-shrink-0"
                      />
                    ))}
                  </div>
                )}

                <AdminDealActions dealId={deal.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
