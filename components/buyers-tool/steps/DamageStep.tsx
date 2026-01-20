'use client'

/**
 * DamageStep Component
 *
 * Step 2: Collect damage location, severity, and types.
 */

import type { DamageInfo, DamageLocation, DamageSeverity, DamageType } from '@/lib/buyers-tool'

const DAMAGE_LOCATIONS: { value: DamageLocation; label: string; description: string }[] = [
  { value: 'front_door', label: 'Front Door', description: 'Door panel or handle area' },
  { value: 'front_panel', label: 'Front Panel', description: 'Below door, drawer front' },
  { value: 'control_panel', label: 'Control Panel', description: 'Buttons, display area' },
  { value: 'handle', label: 'Handle', description: 'Door or drawer handle' },
  { value: 'left_side', label: 'Left Side', description: 'Left side panel' },
  { value: 'right_side', label: 'Right Side', description: 'Right side panel' },
  { value: 'back', label: 'Back', description: 'Rear panel' },
  { value: 'top', label: 'Top', description: 'Top surface' },
  { value: 'bottom', label: 'Bottom', description: 'Base or bottom panel' },
]

const DAMAGE_SEVERITIES: { value: DamageSeverity; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Minor, barely noticeable up close' },
  { value: 'moderate', label: 'Moderate', description: 'Visible but not prominent' },
  { value: 'severe', label: 'Severe', description: 'Easily noticeable, significant damage' },
]

const DAMAGE_TYPES: { value: DamageType; label: string }[] = [
  { value: 'scratch', label: 'Scratch' },
  { value: 'dent', label: 'Dent' },
  { value: 'scuff', label: 'Scuff' },
  { value: 'discoloration', label: 'Discoloration' },
]

interface DamageStepProps {
  data: Partial<DamageInfo>
  onChange: (data: Partial<DamageInfo>) => void
}

export function DamageStep({ data, onChange }: DamageStepProps) {
  const locations = data.locations ?? []
  const types = data.types ?? []

  const toggleLocation = (location: DamageLocation) => {
    const updated = locations.includes(location)
      ? locations.filter((l) => l !== location)
      : [...locations, location]
    onChange({ locations: updated })
  }

  const toggleType = (type: DamageType) => {
    const updated = types.includes(type)
      ? types.filter((t) => t !== type)
      : [...types, type]
    onChange({ types: updated })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Where is the damage?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Select all areas with cosmetic damage.
        </p>
      </div>

      {/* Damage Locations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Damage Locations <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {DAMAGE_LOCATIONS.map(({ value, label, description }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                locations.includes(value)
                  ? 'border-sage-500 bg-sage-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={locations.includes(value)}
                onChange={() => toggleLocation(value)}
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
      </div>

      {/* Damage Severity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Damage Severity <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {DAMAGE_SEVERITIES.map(({ value, label, description }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                data.severity === value
                  ? 'border-sage-500 bg-sage-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="severity"
                checked={data.severity === value}
                onChange={() => onChange({ severity: value })}
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

      {/* Damage Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type of Damage <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DAMAGE_TYPES.map(({ value, label }) => (
            <label
              key={value}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                types.includes(value)
                  ? 'border-sage-500 bg-sage-50 text-sage-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={types.includes(value)}
                onChange={() => toggleType(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
