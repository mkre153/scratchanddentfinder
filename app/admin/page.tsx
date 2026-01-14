/**
 * Admin Dashboard - Slice 6: Trust Promotion, Slice 10: Operator Control
 *
 * Non-discoverable admin page:
 * - NOT in sitemap
 * - NO public links
 * - force-dynamic (no static rendering)
 * - Role-based auth (not just obscurity)
 *
 * Enhanced: Added subscriptions visibility (Stripe Hardening)
 */

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { getSubscriptionCounts } from '@/lib/queries'

export default async function AdminDashboard() {
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

  // Get subscription counts for the dashboard
  const counts = await getSubscriptionCounts()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid gap-6">
          {/* Subscriptions - Highlighted if there are past due */}
          <Link
            href="/admin/subscriptions/"
            className={`block p-6 rounded-lg shadow hover:shadow-md transition-shadow ${
              counts.pastDue > 0
                ? 'bg-red-50 border-2 border-red-200'
                : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Subscriptions
                </h2>
                <p className="text-gray-600">
                  View and manage billing subscriptions
                </p>
              </div>
              <div className="text-right">
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    {counts.active} active
                  </span>
                  {counts.pastDue > 0 && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      {counts.pastDue} past due
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/submissions/"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Pending Submissions
            </h2>
            <p className="text-gray-600">
              Review and approve store submissions
            </p>
          </Link>

          <Link
            href="/admin/claims/"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ownership Claims
            </h2>
            <p className="text-gray-600">
              Review store ownership claim requests
            </p>
          </Link>

          <Link
            href="/admin/stores/"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Store Management
            </h2>
            <p className="text-gray-600">
              Manage store tiers and featured status
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
