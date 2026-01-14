/**
 * Password Reset Page
 *
 * Two-step flow:
 * 1. User enters email to request reset link
 * 2. User clicks link and sets new password (handled by update-password page)
 */

import { ResetPasswordForm } from './ResetPasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | Scratch & Dent Finder',
  description: 'Reset your account password',
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string }
}) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {searchParams.error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{searchParams.error}</p>
          </div>
        )}

        {searchParams.success && (
          <div className="rounded-md bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800">{searchParams.success}</p>
          </div>
        )}

        <ResetPasswordForm />
      </div>
    </div>
  )
}
