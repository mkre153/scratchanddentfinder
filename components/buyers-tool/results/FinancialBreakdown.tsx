'use client'

/**
 * FinancialBreakdown Component
 *
 * Displays deal context and price difference information.
 * Reframed as patterns and considerations, not predictions or outcomes.
 */

import type { FinancialResult, DiscountRating } from '@/lib/buyers-tool'
import { DollarSign, TrendingDown, Info } from 'lucide-react'

// Map discount ratings to qualitative context labels
const CONTEXT_LABELS: Record<DiscountRating, { label: string; bg: string; text: string }> = {
  excellent: { label: 'Strong', bg: 'bg-sage-100', text: 'text-sage-700' },
  good: { label: 'Typical', bg: 'bg-blue-100', text: 'text-blue-700' },
  fair: { label: 'Typical', bg: 'bg-amber-100', text: 'text-amber-700' },
  poor: { label: 'Low', bg: 'bg-red-100', text: 'text-red-700' },
}

interface FinancialBreakdownProps {
  financial: FinancialResult
}

export function FinancialBreakdown({ financial }: FinancialBreakdownProps) {
  const contextConfig = CONTEXT_LABELS[financial.discountRating]

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <DollarSign className="h-5 w-5 text-sage-600" />
        Deal Context
      </h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Deal Context */}
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Discount Level</p>
          <div className="mt-1">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${contextConfig.bg} ${contextConfig.text}`}
            >
              {contextConfig.label}
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Listings with similar damage often fall within this general range.
          </p>
        </div>

        {/* Price Difference vs New */}
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Price Difference vs New</p>
          <div className="mt-1 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-sage-600" />
            <span className="text-sm font-medium text-gray-900">
              Listed below typical retail
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Compare with current retail prices to understand the gap.
          </p>
        </div>
      </div>

      {/* Contextual Notes */}
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 p-3">
        <Info className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
        <p className="text-xs text-gray-500">
          Discount patterns vary by retailer, region, and inventory age. Use this
          context to frame your conversation with the seller.
        </p>
      </div>
    </div>
  )
}
