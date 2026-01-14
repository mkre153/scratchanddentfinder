/**
 * Stripe Configuration
 *
 * Server-side Stripe client and price configuration.
 * Slice 13: Stripe Integration
 *
 * IMPORTANT: Only import this file in server components/API routes.
 * The secret key must never be exposed to the client.
 */

import Stripe from 'stripe'

// =============================================================================
// Stripe Client
// =============================================================================

/**
 * Get the Stripe client instance
 * Lazily initialized to avoid build-time errors when env vars are not set
 */
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// Alias for cleaner imports
export const stripe = { get: getStripe }

// =============================================================================
// Price Configuration
// =============================================================================

/**
 * Stripe Price IDs for featured listing tiers
 *
 * These must be created in Stripe Dashboard first:
 * - Monthly: $29/month recurring
 * - Annual: $290/year recurring
 */
export const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  annual: process.env.STRIPE_PRICE_ANNUAL!,
} as const

export type PriceTier = keyof typeof PRICES

/**
 * Calculate featured_until date based on tier
 *
 * Monthly: 30 days from now
 * Annual: 365 days from now
 */
export function calculateFeaturedUntil(tier: PriceTier): Date {
  const now = new Date()
  switch (tier) {
    case 'monthly':
      return new Date(now.setDate(now.getDate() + 30))
    case 'annual':
      return new Date(now.setDate(now.getDate() + 365))
  }
}

// =============================================================================
// URL Helpers
// =============================================================================

/**
 * Get the base URL for redirects
 * Uses SITE_URL in production, localhost in development
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}
