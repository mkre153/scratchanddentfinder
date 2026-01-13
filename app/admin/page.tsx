/**
 * Admin Dashboard - Slice 6: Trust Promotion
 *
 * Non-discoverable admin page:
 * - NOT in sitemap
 * - NO public links
 * - force-dynamic (no static rendering)
 */

export const dynamic = 'force-dynamic'

import Link from 'next/link'

export default function AdminDashboard() {
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
        </div>
      </div>
    </div>
  )
}
