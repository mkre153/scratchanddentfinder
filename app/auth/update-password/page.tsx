/**
 * Update Password Page
 *
 * Users land here after clicking the password reset email link.
 * Supabase automatically handles the token exchange via the callback.
 */

import { UpdatePasswordForm } from './UpdatePasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set New Password | Scratch & Dent Finder',
  description: 'Set a new password for your account',
}

export default function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Set new password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {searchParams.error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{searchParams.error}</p>
          </div>
        )}

        <UpdatePasswordForm />
      </div>
    </div>
  )
}
