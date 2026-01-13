/**
 * Admin Dashboard - Slice 6: Trust Promotion, Slice 10: Operator Control
 *
 * Non-discoverable admin page:
 * - NOT in sitemap
 * - NO public links
 * - force-dynamic (no static rendering)
 * - Role-based auth (not just obscurity)
 */

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'

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
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid gap-6">
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
