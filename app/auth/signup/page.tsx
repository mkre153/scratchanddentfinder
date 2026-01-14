/**
 * Sign Up Page
 *
 * Uses Supabase Auth UI for new user registration.
 * Supports email/password and magic link.
 */

import { SignUpForm } from './SignUpForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Scratch & Dent Finder',
  description: 'Create an account to manage your store listing',
}

export default function SignUpPage({
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to claim and manage your store listing
          </p>
        </div>

        {searchParams.error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{searchParams.error}</p>
          </div>
        )}

        <SignUpForm redirectTo={redirectTo} />
      </div>
    </div>
  )
}
