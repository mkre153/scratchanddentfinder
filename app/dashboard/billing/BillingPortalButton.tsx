'use client'

/**
 * Billing Portal Button
 *
 * Client component that calls the billing portal API
 * and redirects to Stripe Customer Portal.
 *
 * Slice 13: Stripe Integration
 */

import { useState } from 'react'

interface BillingPortalButtonProps {
  apiUrl: string
}

export function BillingPortalButton({ apiUrl }: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Manage Billing'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
