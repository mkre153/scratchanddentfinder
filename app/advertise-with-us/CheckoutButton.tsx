'use client'

/**
 * Checkout Button
 *
 * Client component that initiates Stripe Checkout.
 * If user is not authenticated, redirects to sign in first.
 *
 * Slice 13: Stripe Integration
 */

import { useState } from 'react'
import { getCheckoutApiUrl } from '@/lib/urls'

interface CheckoutButtonProps {
  storeId?: number
  tier: 'monthly' | 'annual'
  className?: string
  children: React.ReactNode
}

export function CheckoutButton({
  storeId,
  tier,
  className,
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    // If no storeId, this is a general CTA - redirect to store submit
    if (!storeId) {
      window.location.href = '/stores/new/'
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(getCheckoutApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeId, tier }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - redirect to sign in
          // After sign in, redirect back here
          window.location.href = '/auth/signin?redirect=/advertise-with-us/'
          return
        }
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
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
        className={className}
      >
        {loading ? 'Loading...' : children}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
