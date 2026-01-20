'use client'

/**
 * WarrantyStep Component
 *
 * Step 4: Collect warranty coverage details.
 */

import type { WarrantyInfo } from '@/lib/buyers-tool'
import { Shield, AlertCircle } from 'lucide-react'

interface WarrantyStepProps {
  data: Partial<WarrantyInfo>
  onChange: (data: Partial<WarrantyInfo>) => void
}

export function WarrantyStep({ data, onChange }: WarrantyStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          What&apos;s covered?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Warranty coverage is crucial for scratch & dent purchases.
        </p>
      </div>

      {/* Manufacturer Warranty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Is the manufacturer warranty included? <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
            { value: 'unknown', label: 'Not Sure' },
          ].map(({ value, label }) => (
            <label
              key={String(value)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition ${
                data.manufacturerCovered === value ||
                (value === 'unknown' && data.manufacturerCovered === undefined)
                  ? 'border-sage-500 bg-sage-50 text-sage-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="manufacturerCovered"
                checked={data.manufacturerCovered === value}
                onChange={() =>
                  onChange({
                    manufacturerCovered: value as boolean | 'unknown',
                  })
                }
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Manufacturer warranties typically cover functional defects but may be
          voided by cosmetic damage. Ask the retailer to confirm.
        </p>
      </div>

      {/* Retailer Warranty */}
      <div>
        <label
          htmlFor="retailerWarranty"
          className="block text-sm font-medium text-gray-700"
        >
          Retailer Warranty (months) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="retailerWarranty"
          min="0"
          max="120"
          value={data.retailerWarrantyMonths ?? ''}
          onChange={(e) =>
            onChange({
              retailerWarrantyMonths: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          placeholder="0"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500 sm:w-32"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter 0 if no retailer warranty is included
        </p>
      </div>

      {/* Coverage Details */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          What does the warranty cover?
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:border-gray-300">
          <input
            type="checkbox"
            checked={data.laborIncluded ?? false}
            onChange={(e) => onChange({ laborIncluded: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
          />
          <div>
            <span className="block text-sm font-medium text-gray-900">
              Labor Included
            </span>
            <span className="block text-xs text-gray-500">
              Repair technician visits are covered
            </span>
          </div>
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:border-gray-300">
          <input
            type="checkbox"
            checked={data.partsIncluded ?? false}
            onChange={(e) => onChange({ partsIncluded: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
          />
          <div>
            <span className="block text-sm font-medium text-gray-900">
              Parts Included
            </span>
            <span className="block text-xs text-gray-500">
              Replacement parts are covered
            </span>
          </div>
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:border-gray-300">
          <input
            type="checkbox"
            checked={data.extendedAvailable ?? false}
            onChange={(e) => onChange({ extendedAvailable: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
          />
          <div>
            <span className="block text-sm font-medium text-gray-900">
              Extended Warranty Available
            </span>
            <span className="block text-xs text-gray-500">
              Option to purchase additional coverage
            </span>
          </div>
        </label>
      </div>

      {/* Warning for no warranty */}
      {data.manufacturerCovered === false &&
        data.retailerWarrantyMonths !== undefined &&
        data.retailerWarrantyMonths < 1 && (
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              <strong>Heads up:</strong> Buying without warranty coverage carries
              higher risk. Make sure the discount compensates for this.
            </p>
          </div>
        )}

      {/* Good coverage indicator */}
      {data.manufacturerCovered === true &&
        data.retailerWarrantyMonths !== undefined &&
        data.retailerWarrantyMonths >= 3 && (
          <div className="flex items-start gap-3 rounded-lg bg-sage-50 p-4">
            <Shield className="h-5 w-5 flex-shrink-0 text-sage-600" />
            <p className="text-sm text-sage-800">
              <strong>Good coverage:</strong> Having both manufacturer and retailer
              warranty provides solid protection.
            </p>
          </div>
        )}
    </div>
  )
}
