/**
 * Sign In Page
 *
 * Uses Supabase Auth UI for authentication.
 * Supports email/password and magic link.
 */

import { SignInForm } from './SignInForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Scratch & Dent Locator',
  description: 'Sign in to manage your store listing',
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect?: string; error?: string }
}) {
  const redirectTo = searchParams.redirect || '/dashboard/'

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Or create a new account to get started
          </p>
        </div>

        {searchParams.error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{searchParams.error}</p>
          </div>
        )}

        <SignInForm redirectTo={redirectTo} />
      </div>
    </div>
  )
}
