'use client'

/**
 * LogisticsAdvice Component
 *
 * Displays delivery and transport recommendations.
 */

import type { LogisticsResult, DeliveryRecommendation } from '@/lib/buyers-tool'
import { Truck, Package, Wrench } from 'lucide-react'

const DELIVERY_CONFIG: Record<
  DeliveryRecommendation,
  { icon: typeof Truck; label: string; description: string }
> = {
  professional: {
    icon: Truck,
    label: 'Professional Delivery Recommended',
    description: 'This appliance is best delivered by professionals.',
  },
  self_transport: {
    icon: Package,
    label: 'Self-Transport OK',
    description: 'You can safely transport this yourself with the right vehicle.',
  },
  either: {
    icon: Truck,
    label: 'Either Works',
    description: 'Professional delivery or self-transport are both reasonable options.',
  },
}

interface LogisticsAdviceProps {
  logistics: LogisticsResult
}

export function LogisticsAdvice({ logistics }: LogisticsAdviceProps) {
  const deliveryConfig = DELIVERY_CONFIG[logistics.deliveryRecommendation]
  const DeliveryIcon = deliveryConfig.icon

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Truck className="h-5 w-5 text-sage-600" />
        Delivery & Installation
      </h3>

      <div className="mt-4 space-y-4">
        {/* Delivery Recommendation */}
        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
          <DeliveryIcon className="h-6 w-6 flex-shrink-0 text-sage-600" />
          <div>
            <p className="font-medium text-gray-900">
              {deliveryConfig.label}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {logistics.deliveryReason || deliveryConfig.description}
            </p>
          </div>
        </div>

        {/* Transport Requirements */}
        {logistics.transportRequirements.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Package className="h-4 w-4" />
              Transport Requirements
            </h4>
            <ul className="mt-2 space-y-1">
              {logistics.transportRequirements.map((req, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Installation Notes */}
        {logistics.installationNotes.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Wrench className="h-4 w-4" />
              Installation Notes
            </h4>
            <ul className="mt-2 space-y-1">
              {logistics.installationNotes.map((note, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
