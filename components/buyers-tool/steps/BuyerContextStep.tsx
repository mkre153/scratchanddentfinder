'use client'

/**
 * BuyerContextStep Component
 *
 * Step 7: Collect buyer purpose, risk tolerance, and price flexibility.
 */

import type { BuyerContext, BuyerPurpose, RiskTolerance, PriceFlexibility } from '@/lib/buyers-tool'

const BUYER_PURPOSES: { value: BuyerPurpose; label: string; description: string }[] = [
  {
    value: 'primary_home',
    label: 'Primary Home',
    description: 'Your main residence, daily use',
  },
  {
    value: 'rental_property',
    label: 'Rental Property',
    description: 'For tenants, less personal use',
  },
  {
    value: 'flip',
    label: 'Home Flip / Resale',
    description: 'Short-term ownership, reselling soon',
  },
  {
    value: 'temporary',
    label: 'Temporary Use',
    description: 'Short-term need, bridge solution',
  },
]

const RISK_TOLERANCES: { value: RiskTolerance; label: string; description: string }[] = [
  {
    value: 'low',
    label: 'Low Risk',
    description: 'Prefer maximum warranty and protection, willing to pay more for peace of mind',
  },
  {
    value: 'moderate',
    label: 'Moderate Risk',
    description: 'Balanced approach, acceptable trade-offs for good deals',
  },
  {
    value: 'high',
    label: 'High Risk',
    description: 'Comfortable with uncertainty for maximum savings',
  },
]

const PRICE_FLEXIBILITIES: { value: PriceFlexibility; label: string; description: string }[] = [
  {
    value: 'firm',
    label: 'Price is Firm',
    description: 'Listed price is what you expect to pay',
  },
  {
    value: 'negotiable',
    label: 'Price is Negotiable',
    description: 'There may be room to negotiate further',
  },
]

interface BuyerContextStepProps {
  data: Partial<BuyerContext>
  onChange: (data: Partial<BuyerContext>) => void
}

export function BuyerContextStep({ data, onChange }: BuyerContextStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          What&apos;s your situation?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          This helps us tailor the recommendation to your needs.
        </p>
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What&apos;s this appliance for? <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {BUYER_PURPOSES.map(({ value, label, description }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                data.purpose === value
                  ? 'border-sage-500 bg-sage-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="purpose"
                checked={data.purpose === value}
                onChange={() => onChange({ purpose: value })}
                className="mt-0.5 h-4 w-4 border-gray-300 text-sage-600 focus:ring-sage-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900">
                  {label}
                </span>
                <span className="block text-xs text-gray-500">{description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Risk Tolerance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How much risk are you comfortable with? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {RISK_TOLERANCES.map(({ value, label, description }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                data.riskTolerance === value
                  ? 'border-sage-500 bg-sage-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="riskTolerance"
                checked={data.riskTolerance === value}
                onChange={() => onChange({ riskTolerance: value })}
                className="mt-0.5 h-4 w-4 border-gray-300 text-sage-600 focus:ring-sage-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900">
                  {label}
                </span>
                <span className="block text-xs text-gray-500">{description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Price Flexibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Is the price negotiable? <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {PRICE_FLEXIBILITIES.map(({ value, label, description }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                data.priceFlexibility === value
                  ? 'border-sage-500 bg-sage-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="priceFlexibility"
                checked={data.priceFlexibility === value}
                onChange={() => onChange({ priceFlexibility: value })}
                className="mt-0.5 h-4 w-4 border-gray-300 text-sage-600 focus:ring-sage-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900">
                  {label}
                </span>
                <span className="block text-xs text-gray-500">{description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
