'use client'

/**
 * InspectionStep Component
 *
 * Step 8 (Optional): Collect safety inspection results.
 * This step is optional - users can skip if they haven't inspected yet.
 */

import type { InspectionResults } from '@/lib/buyers-tool'
import { AlertTriangle, Info } from 'lucide-react'

// Items that are blockers if checked
const BLOCKER_ITEMS = [
  { key: 'rustPresent', label: 'Rust Present', description: 'Any visible rust on the unit' },
  { key: 'waterStains', label: 'Water Stains', description: 'Signs of water damage or staining' },
  { key: 'cordDamaged', label: 'Damaged Power Cord', description: 'Frayed, cracked, or damaged cord' },
  { key: 'odorsPresent', label: 'Unusual Odors', description: 'Burning, mold, or chemical smells' },
  { key: 'missingParts', label: 'Missing Parts', description: 'Shelves, drawers, or components missing' },
] as const

// Items that are warnings
const WARNING_ITEMS = [
  { key: 'unusualSounds', label: 'Unusual Sounds', description: 'Clicking, grinding, or rattling when running' },
  { key: 'priorRepairsEvident', label: 'Evidence of Prior Repairs', description: 'Visible repair work or replaced parts' },
] as const

// Info items
const INFO_ITEMS = [
  { key: 'powerOnWorks', label: 'Powers On & Works', description: 'Unit turns on and basic functions work' },
] as const

interface InspectionStepProps {
  data: Partial<InspectionResults>
  onChange: (data: Partial<InspectionResults>) => void
}

export function InspectionStep({ data, onChange }: InspectionStepProps) {
  const hasBlockers = BLOCKER_ITEMS.some(
    (item) => data[item.key as keyof InspectionResults] === true
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Did you inspect it?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          If you&apos;ve had a chance to inspect the appliance, let us know what
          you found. This step is optional.
        </p>
      </div>

      {/* Info Notice */}
      <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
        <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
        <p className="text-sm text-blue-800">
          Skip this step if you haven&apos;t inspected the unit yet. You can
          still get a recommendation based on the other information you&apos;ve
          provided.
        </p>
      </div>

      {/* Power Test */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700">
          Power Test
        </h3>
        {INFO_ITEMS.map(({ key, label, description }) => (
          <label
            key={key}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
              data[key as keyof InspectionResults] === true
                ? 'border-sage-500 bg-sage-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={data[key as keyof InspectionResults] === true}
              onChange={(e) =>
                onChange({ [key]: e.target.checked || undefined })
              }
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-sage-600 focus:ring-sage-500"
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

      {/* Safety Red Flags (Blockers) */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Safety Red Flags
        </h3>
        <p className="mb-3 text-xs text-gray-500">
          These issues are serious safety concerns. If any are present, we
          strongly recommend walking away from this deal.
        </p>
        <div className="space-y-2">
          {BLOCKER_ITEMS.map(({ key, label, description }) => (
            <label
              key={key}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                data[key as keyof InspectionResults] === true
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={data[key as keyof InspectionResults] === true}
                onChange={(e) =>
                  onChange({ [key]: e.target.checked || undefined })
                }
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
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

      {/* Warning Items */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700">
          Potential Concerns
        </h3>
        <div className="space-y-2">
          {WARNING_ITEMS.map(({ key, label, description }) => (
            <label
              key={key}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                data[key as keyof InspectionResults] === true
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={data[key as keyof InspectionResults] === true}
                onChange={(e) =>
                  onChange({ [key]: e.target.checked || undefined })
                }
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
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

      {/* Blocker Warning */}
      {hasBlockers && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Safety concerns detected
            </p>
            <p className="mt-1 text-sm text-red-700">
              The issues you&apos;ve marked are serious safety red flags. Our
              recommendation will likely be to walk away from this deal.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
