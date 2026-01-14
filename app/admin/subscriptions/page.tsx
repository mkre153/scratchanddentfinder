/**
 * Admin Subscriptions - Stripe Hardening
 *
 * Non-discoverable admin page:
 * - NOT in sitemap
 * - NO public links
 * - force-dynamic (no static rendering)
 * - Role-based auth
 *
 * Allows admins to:
 * - View all subscriptions with status
 * - Filter by status (active, past_due, canceled)
 * - Extend featured_until for stores
 * - Link to Stripe dashboard
 */

export const dynamic = 'force-dynamic'

import {
  getAllSubscriptionsForAdmin,
  getSubscriptionCounts,
  extendStoreFeatured,
} from '@/lib/queries'
import { requireAdmin } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

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
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

async function handleExtendFeatured(formData: FormData) {
  'use server'
  const storeId = parseInt(formData.get('storeId') as string, 10)
  const days = parseInt(formData.get('days') as string, 10)

  if (!storeId || !days) return

  try {
    await extendStoreFeatured(storeId, days)
    revalidatePath('/admin/subscriptions/')
  } catch (error) {
    console.error('Failed to extend featured:', error)
  }
}

export default async function AdminSubscriptions({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const { isAuthorized } = await requireAdmin()

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Not Authorized
          </h1>
          <p className="text-gray-600">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    )
  }

  const statusFilter = (searchParams.status as 'active' | 'past_due' | 'canceled' | 'all') || 'all'

  const [subscriptions, counts] = await Promise.all([
    getAllSubscriptionsForAdmin(100, 0, statusFilter),
    getSubscriptionCounts(),
  ])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
            <p className="text-gray-600 mt-1">
              {counts.total} total • {counts.active} active • {counts.pastDue} past due • {counts.canceled} canceled
            </p>
          </div>
          <Link href="/admin/" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          <Link
            href="/admin/subscriptions/"
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({counts.total})
          </Link>
          <Link
            href="/admin/subscriptions/?status=active"
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Active ({counts.active})
          </Link>
          <Link
            href="/admin/subscriptions/?status=past_due"
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'past_due'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Past Due ({counts.pastDue})
          </Link>
          <Link
            href="/admin/subscriptions/?status=canceled"
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'canceled'
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Canceled ({counts.canceled})
          </Link>
        </div>

        {/* Subscriptions Table */}
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No subscriptions found.</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period End
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured Until
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {sub.storeName}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {sub.storeAddress}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {sub.userEmail ?? 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {sub.userId.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {sub.tier}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.featuredUntil
                        ? new Date(sub.featuredUntil).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2 items-center">
                        {/* Extend Featured Form */}
                        <form
                          action={handleExtendFeatured}
                          className="flex gap-1 items-center"
                        >
                          <input type="hidden" name="storeId" value={sub.storeId} />
                          <select
                            name="days"
                            className="text-xs border border-gray-300 rounded px-1 py-1"
                          >
                            <option value="7">+7d</option>
                            <option value="30">+30d</option>
                            <option value="90">+90d</option>
                            <option value="365">+1y</option>
                          </select>
                          <button
                            type="submit"
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Extend
                          </button>
                        </form>

                        {/* Stripe Dashboard Link */}
                        {sub.stripeSubscriptionId && (
                          <a
                            href={`https://dashboard.stripe.com/test/subscriptions/${sub.stripeSubscriptionId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Stripe →
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stripe IDs Reference (Collapsed by default) */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Show Stripe IDs (for debugging)
          </summary>
          <div className="mt-2 overflow-hidden bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Store</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Customer ID</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Subscription ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-2 text-gray-900">{sub.storeName}</td>
                    <td className="px-4 py-2 font-mono text-gray-500">
                      {sub.stripeCustomerId}
                    </td>
                    <td className="px-4 py-2 font-mono text-gray-500">
                      {sub.stripeSubscriptionId ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  )
}
