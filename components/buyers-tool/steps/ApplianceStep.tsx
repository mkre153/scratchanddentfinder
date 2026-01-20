'use client'

/**
 * ApplianceStep Component
 *
 * Step 1: Collect appliance type, brand, and pricing information.
 */

import type { ApplianceInfo, ApplianceType } from '@/lib/buyers-tool'

const APPLIANCE_TYPES: { value: ApplianceType; label: string }[] = [
  { value: 'refrigerator', label: 'Refrigerator' },
  { value: 'washer', label: 'Washer' },
  { value: 'dryer', label: 'Dryer' },
  { value: 'range', label: 'Range / Oven' },
  { value: 'dishwasher', label: 'Dishwasher' },
  { value: 'microwave', label: 'Microwave' },
]

interface ApplianceStepProps {
  data: Partial<ApplianceInfo>
  onChange: (data: Partial<ApplianceInfo>) => void
}

export function ApplianceStep({ data, onChange }: ApplianceStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          What are you buying?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Tell us about the appliance you&apos;re considering.
        </p>
      </div>

      {/* Appliance Type */}
      <div>
        <label
          htmlFor="applianceType"
          className="block text-sm font-medium text-gray-700"
        >
          Appliance Type <span className="text-red-500">*</span>
        </label>
        <select
          id="applianceType"
          value={data.type ?? ''}
          onChange={(e) =>
            onChange({ type: e.target.value as ApplianceType || undefined })
          }
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
        >
          <option value="">Select appliance type...</option>
          {APPLIANCE_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Brand (Optional) */}
      <div>
        <label
          htmlFor="brand"
          className="block text-sm font-medium text-gray-700"
        >
          Brand <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          id="brand"
          value={data.brand ?? ''}
          onChange={(e) => onChange({ brand: e.target.value || undefined })}
          placeholder="e.g., Samsung, LG, Whirlpool"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
        />
      </div>

      {/* Pricing Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Retail Price */}
        <div>
          <label
            htmlFor="retailPrice"
            className="block text-sm font-medium text-gray-700"
          >
            Retail Price <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              id="retailPrice"
              min="0"
              step="1"
              value={data.retailPrice ?? ''}
              onChange={(e) =>
                onChange({
                  retailPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="0"
              className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Original price when new
          </p>
        </div>

        {/* Asking Price */}
        <div>
          <label
            htmlFor="askingPrice"
            className="block text-sm font-medium text-gray-700"
          >
            Asking Price <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              id="askingPrice"
              min="0"
              step="1"
              value={data.askingPrice ?? ''}
              onChange={(e) =>
                onChange({
                  askingPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="0"
              className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Current scratch & dent price
          </p>
        </div>
      </div>

      {/* Discount Preview */}
      {data.retailPrice && data.askingPrice && data.askingPrice <= data.retailPrice && (
        <div className="rounded-lg bg-sage-50 p-4">
          <p className="text-sm text-sage-700">
            <span className="font-semibold">
              {Math.round(((data.retailPrice - data.askingPrice) / data.retailPrice) * 100)}% off
            </span>
            {' '}retail price (${data.retailPrice - data.askingPrice} savings)
          </p>
        </div>
      )}
    </div>
  )
}
