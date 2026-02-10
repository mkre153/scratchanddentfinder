/**
 * Admin Store Management
 *
 * Non-discoverable admin page:
 * - NOT in sitemap
 * - NO public links
 * - force-dynamic (no static rendering)
 * - Role-based auth (not just obscurity)
 *
 * Shows store listing status and claimed status.
 */

export const dynamic = 'force-dynamic'

import { getStoresForAdmin } from '@/lib/queries'
import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'

export default async function AdminStores() {
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

  const { stores, total } = await getStoresForAdmin(100, 0)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
            <p className="text-gray-600 mt-1">
              {total} stores total
            </p>
          </div>
          <Link
            href="/admin/"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="overflow-hidden bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claimed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stores.map((store) => (
                <tr key={store.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {store.name}
                    </div>
                    <div className="text-sm text-gray-500">{store.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {store.isApproved ? (
                      <span className="text-green-600">Approved</span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {store.claimedBy ? (
                      <span className="text-green-600">Claimed</span>
                    ) : (
                      <span className="text-gray-400">Unclaimed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
