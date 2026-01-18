'use client'

/**
 * InstallationStep Component
 *
 * Step 6: Collect installation type and visible sides.
 */

import type { InstallationInfo, InstallationType, VisibleSide } from '@/lib/buyers-tool'

const INSTALLATION_TYPES: { value: InstallationType; label: string; description: string }[] = [
  {
    value: 'freestanding',
    label: 'Freestanding',
    description: 'Standalone unit, not enclosed by cabinets',
  },
  {
    value: 'built_in',
    label: 'Built-in',
    description: 'Integrated into cabinetry, sides may be hidden',
  },
  {
    value: 'stacked',
    label: 'Stacked',
    description: 'Washer/dryer stacked configuration',
  },
]

const VISIBLE_SIDES: { value: VisibleSide; label: string }[] = [
  { value: 'front', label: 'Front' },
  { value: 'left', label: 'Left Side' },
  { value: 'right', label: 'Right Side' },
  { value: 'top', label: 'Top' },
]

interface InstallationStepProps {
  data: Partial<InstallationInfo>
  onChange: (data: Partial<InstallationInfo>) => void
}

export function InstallationStep({ data, onChange }: InstallationStepProps) {
  const visibleSides = data.visibleSides ?? []

  const toggleVisibleSide = (side: VisibleSide) => {
    const updated = visibleSides.includes(side)
      ? visibleSides.filter((s) => s !== side)
      : [...visibleSides, side]
    onChange({ visibleSides: updated })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Where will it go?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Damage visibility depends on how the appliance will be installed.
        </p>
      </div>

      {/* Installation Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Installation Type <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {INSTALLATION_TYPES.map(({ value, label, description }) => (
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
                name="installationType"
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

      {/* Visible Sides */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Which sides will be visible? <span className="text-red-500">*</span>
        </label>
        <p className="mb-3 text-xs text-gray-500">
          Select all sides that will be visible after installation. Damage on
          hidden sides won&apos;t affect your day-to-day experience.
        </p>
        <div className="flex flex-wrap gap-2">
          {VISIBLE_SIDES.map(({ value, label }) => (
            <label
              key={value}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${
                visibleSides.includes(value)
                  ? 'border-sage-500 bg-sage-50 text-sage-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={visibleSides.includes(value)}
                onChange={() => toggleVisibleSide(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Visibility Insight */}
      {visibleSides.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Visible sides:</span>{' '}
            {visibleSides
              .map((s) => VISIBLE_SIDES.find((vs) => vs.value === s)?.label)
              .join(', ')}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            We&apos;ll check if the damage locations affect these visible areas.
          </p>
        </div>
      )}
    </div>
  )
}
