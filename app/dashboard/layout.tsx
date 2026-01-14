/**
 * Dashboard Layout
 *
 * Protected layout for authenticated store owners.
 * Slice 13: Stripe Integration
 *
 * Redirects to homepage if not authenticated.
 */

import { createAuthClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDashboardUrl, getDashboardBillingUrl, getHomepageUrl } from '@/lib/urls'
import { LogoutButton } from '@/components/auth/LogoutButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const cookieStore = await cookies()
  const supabase = await createAuthClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(getHomepageUrl())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <nav className="flex items-center gap-6">
              <Link
                href={getDashboardUrl()}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Overview
              </Link>
              <Link
                href={getDashboardBillingUrl()}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Billing
              </Link>
              <LogoutButton />
            </nav>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}
