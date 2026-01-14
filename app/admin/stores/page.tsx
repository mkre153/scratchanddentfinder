/**
 * Admin Store Management - Slice 10: Operator Control
 *
 * Non-discoverable admin page:
 * - NOT in sitemap
 * - NO public links
 * - force-dynamic (no static rendering)
 * - Role-based auth (not just obscurity)
 *
 * Allows admins to:
 * - Set store tier (monetization status) - does NOT auto-flip is_featured
 * - Toggle is_featured (SEO exposure) - separate from tier
 *
 * Key principle: Tier != Exposure
 */

export const dynamic = 'force-dynamic'

import { getStoresForAdmin, setStoreTier, setStoreFeatured } from '@/lib/queries'
import { requireAdmin } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

async function handleSetTier(formData: FormData) {
  'use server'
  const storeId = parseInt(formData.get('storeId') as string, 10)
  const tier = formData.get('tier') as string
  const featuredUntil = formData.get('featuredUntil') as string

  if (!storeId) return

  try {
    await setStoreTier(
      storeId,
      tier === 'none' ? null : (tier as 'monthly' | 'annual'),
      tier === 'none' ? null : featuredUntil || null
    )
    revalidatePath('/admin/stores/')
  } catch (error) {
    console.error('Failed to set tier:', error)
  }
}

async function handleToggleFeatured(formData: FormData) {
  'use server'
  const storeId = parseInt(formData.get('storeId') as string, 10)
  const isFeatured = formData.get('isFeatured') === 'true'

  if (!storeId) return

  try {
    await setStoreFeatured(storeId, isFeatured)
    revalidatePath('/admin/stores/')
  } catch (error) {
    console.error('Failed to toggle featured:', error)
  }
}

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
              {total} stores total. Tier and Featured are independent.
            </p>
          </div>
          <Link
            href="/admin/"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Tier != Exposure.</strong> Setting a tier does NOT automatically feature a store.
                Use the Featured toggle to control SEO visibility separately.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier (Monetization)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured (Exposure)
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <form action={handleSetTier} className="flex gap-2 items-center">
                      <input type="hidden" name="storeId" value={store.id} />
                      <select
                        name="tier"
                        defaultValue={store.featuredTier ?? 'none'}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="none">None</option>
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual</option>
                      </select>
                      <input
                        type="date"
                        name="featuredUntil"
                        defaultValue={store.featuredUntil?.split('T')[0] ?? ''}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Set
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <form action={handleToggleFeatured}>
                      <input type="hidden" name="storeId" value={store.id} />
                      <input
                        type="hidden"
                        name="isFeatured"
                        value={(!store.isFeatured).toString()}
                      />
                      <button
                        type="submit"
                        className={`px-3 py-1 text-sm rounded ${
                          store.isFeatured
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {store.isFeatured ? 'Featured' : 'Not Featured'}
                      </button>
                    </form>
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
