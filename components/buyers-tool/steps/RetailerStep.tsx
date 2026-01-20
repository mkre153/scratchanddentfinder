'use client'

/**
 * RetailerStep Component
 *
 * Step 3: Collect retailer type and inventory age.
 */

import type { RetailerInfo, RetailerType } from '@/lib/buyers-tool'

const RETAILER_TYPES: { value: RetailerType; label: string; description: string }[] = [
  {
    value: 'big_box',
    label: 'Big Box Store',
    description: 'Home Depot, Lowe\'s, Best Buy, etc.',
  },
  {
    value: 'independent',
    label: 'Independent Dealer',
    description: 'Local appliance store or family-owned business',
  },
  {
    value: 'outlet',
    label: 'Outlet Store',
    description: 'Manufacturer outlet or dedicated scratch & dent store',
  },
  {
    value: 'online',
    label: 'Online Retailer',
    description: 'Amazon, Wayfair, or other e-commerce',
  },
  {
    value: 'liquidation',
    label: 'Liquidation / Auction',
    description: 'Liquidation centers, auctions, or closeout sales',
  },
]

interface RetailerStepProps {
  data: Partial<RetailerInfo>
  onChange: (data: Partial<RetailerInfo>) => void
}

export function RetailerStep({ data, onChange }: RetailerStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Where are you buying?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          The retailer type affects negotiation options and return policies.
        </p>
      </div>

      {/* Retailer Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Retailer Type <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {RETAILER_TYPES.map(({ value, label, description }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                data.type === value
                  ? 'border-sage-500 bg-sage-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="retailerType"
                checked={data.type === value}
                onChange={() => onChange({ type: value })}
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

      {/* Inventory Age */}
      <div>
        <label
          htmlFor="inventoryAge"
          className="block text-sm font-medium text-gray-700"
        >
          Days on Floor <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="number"
          id="inventoryAge"
          min="0"
          value={data.inventoryAgeDays ?? ''}
          onChange={(e) =>
            onChange({
              inventoryAgeDays: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="e.g., 30"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500 sm:w-32"
        />
        <p className="mt-1 text-xs text-gray-500">
          If you know how long this unit has been in the store, enter it here.
          Older inventory often has more negotiation room.
        </p>
      </div>
    </div>
  )
}
