'use client'

/**
 * ReturnPolicyStep Component
 *
 * Step 5: Collect return policy details.
 */

import type { ReturnPolicyInfo } from '@/lib/buyers-tool'
import { AlertTriangle } from 'lucide-react'

interface ReturnPolicyStepProps {
  data: Partial<ReturnPolicyInfo>
  onChange: (data: Partial<ReturnPolicyInfo>) => void
}

export function ReturnPolicyStep({ data, onChange }: ReturnPolicyStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Can you return it?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Return policies vary widely for scratch & dent items.
        </p>
      </div>

      {/* Final Sale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Is this a final sale? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition ${
              data.finalSale === true
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="finalSale"
              checked={data.finalSale === true}
              onChange={() => onChange({ finalSale: true })}
              className="sr-only"
            />
            Yes, final sale
          </label>
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition ${
              data.finalSale === false
                ? 'border-sage-500 bg-sage-50 text-sage-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="finalSale"
              checked={data.finalSale === false}
              onChange={() => onChange({ finalSale: false })}
              className="sr-only"
            />
            No, returns allowed
          </label>
        </div>
      </div>

      {/* Return Window */}
      {data.finalSale === false && (
        <div>
          <label
            htmlFor="windowDays"
            className="block text-sm font-medium text-gray-700"
          >
            Return Window (days) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="windowDays"
            min="0"
            max="365"
            value={data.windowDays ?? ''}
            onChange={(e) =>
              onChange({
                windowDays: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="e.g., 30"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500 sm:w-32"
          />
          <p className="mt-1 text-xs text-gray-500">
            How many days do you have to return it?
          </p>
        </div>
      )}

      {/* For final sale, set windowDays to 0 */}
      {data.finalSale === true && data.windowDays !== 0 && (
        <input type="hidden" value={0} onChange={() => onChange({ windowDays: 0 })} />
      )}

      {/* Restocking Fee */}
      {data.finalSale === false && (
        <div>
          <label
            htmlFor="restockingFee"
            className="block text-sm font-medium text-gray-700"
          >
            Restocking Fee <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative mt-1">
            <input
              type="number"
              id="restockingFee"
              min="0"
              max="100"
              value={data.restockingFeePercent ?? ''}
              onChange={(e) =>
                onChange({
                  restockingFeePercent: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="0"
              className="block w-full rounded-lg border border-gray-300 py-2 pl-3 pr-8 shadow-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500 sm:w-32"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              %
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Some stores charge a fee if you return the item
          </p>
        </div>
      )}

      {/* Final Sale Warning */}
      {data.finalSale === true && (
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Final Sale — No Returns
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Make sure you&apos;re confident in this purchase. Without a return
              option, you&apos;ll want extra warranty protection and a thorough
              inspection before buying.
            </p>
          </div>
        </div>
      )}

      {/* Short Window Warning */}
      {data.finalSale === false &&
        data.windowDays !== undefined &&
        data.windowDays > 0 &&
        data.windowDays < 7 && (
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              <strong>Short window:</strong> A {data.windowDays}-day return window
              gives you limited time to discover issues. Consider testing the
              appliance immediately after delivery.
            </p>
          </div>
        )}
    </div>
  )
}
