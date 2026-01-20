'use client'

/**
 * QuickAssessWidget Component
 *
 * Simplified 4-question deal checker for State/City directory pages.
 * Uses sensible defaults for fields not collected.
 *
 * GUARDRAILS:
 * - Allowed outputs: Verdict badge, 2-4 clarifying bullets, soft CTA
 * - NOT allowed: Financial breakdown, negotiation probability, trace details, percentages
 * - Must show assumptions used
 */

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  compile,
  type BuyerInput,
  type CompilerOutput,
  type Recommendation,
  type DamageLocation,
} from '@/lib/buyers-tool'
import { getBuyersGuideUrl } from '@/lib/urls'
import { Search, CheckCircle, AlertTriangle, XCircle, ShieldX, ArrowRight, Info } from 'lucide-react'

// Default assumptions for fields not collected
const DEFAULT_ASSUMPTIONS: Omit<BuyerInput, 'appliance' | 'damage'> = {
  retailer: { type: 'independent' },
  warranty: {
    manufacturerCovered: 'unknown',
    retailerWarrantyMonths: 3,
    laborIncluded: false,
    partsIncluded: true,
    extendedAvailable: false,
  },
  returnPolicy: {
    windowDays: 14,
    restockingFeePercent: 15,
    finalSale: false,
  },
  installation: {
    type: 'freestanding',
    visibleSides: ['front'],
  },
  buyer: {
    purpose: 'primary_home',
    riskTolerance: 'moderate',
    priceFlexibility: 'negotiable',
  },
}

// Simplified damage location options for the widget
type SimplifiedDamage = 'front' | 'side' | 'back_hidden'

const DAMAGE_MAP: Record<SimplifiedDamage, DamageLocation[]> = {
  front: ['front_door', 'front_panel', 'control_panel', 'handle'],
  side: ['left_side', 'right_side'],
  back_hidden: ['back', 'top', 'bottom'],
}

// Red flags that trigger blockers
type RedFlag = 'none' | 'rust' | 'water' | 'odor'

const VERDICT_CONFIG: Record<
  Recommendation,
  { bg: string; border: string; text: string; label: string; icon: typeof CheckCircle }
> = {
  PROCEED: {
    bg: 'bg-sage-50',
    border: 'border-sage-500',
    text: 'text-sage-700',
    label: 'Good Deal',
    icon: CheckCircle,
  },
  PROCEED_WITH_CAUTION: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    text: 'text-amber-700',
    label: 'Proceed with Caution',
    icon: AlertTriangle,
  },
  SKIP: {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-700',
    label: 'Consider Skipping',
    icon: XCircle,
  },
  WALK_AWAY: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-700',
    label: 'Walk Away',
    icon: ShieldX,
  },
}

// What to clarify next based on verdict and inputs
function getClarifyingBullets(
  output: CompilerOutput,
  damageArea: SimplifiedDamage,
  hasRedFlag: boolean
): string[] {
  const bullets: string[] = []

  // Always suggest warranty clarification since we used defaults
  bullets.push('Ask about warranty coverage')

  // Suggest return policy confirmation
  bullets.push('Confirm return policy window')

  // Visibility check based on damage area
  if (damageArea === 'front') {
    bullets.push('Consider if the visible damage bothers you')
  } else if (damageArea === 'side') {
    bullets.push('Check if damage will be visible in your installation')
  }

  // Red flag specific
  if (hasRedFlag) {
    bullets.push('Have a technician inspect before purchasing')
  }

  // Limit to 4 bullets max
  return bullets.slice(0, 4)
}

interface QuickAssessWidgetProps {
  className?: string
}

export function QuickAssessWidget({ className = '' }: QuickAssessWidgetProps) {
  const [retailPrice, setRetailPrice] = useState('')
  const [askingPrice, setAskingPrice] = useState('')
  const [damageArea, setDamageArea] = useState<SimplifiedDamage | ''>('')
  const [redFlag, setRedFlag] = useState<RedFlag>('none')
  const [output, setOutput] = useState<CompilerOutput | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const canAnalyze = retailPrice && askingPrice && damageArea

  const handleAnalyze = useCallback(() => {
    if (!canAnalyze || !damageArea) return

    setIsAnalyzing(true)

    try {
      // Build inspection results based on red flag (all fields required)
      const inspection =
        redFlag !== 'none'
          ? {
              powerOnWorks: true,
              unusualSounds: false,
              rustPresent: redFlag === 'rust',
              waterStains: redFlag === 'water',
              cordDamaged: false,
              odorsPresent: redFlag === 'odor',
              missingParts: false,
              priorRepairsEvident: false,
            }
          : undefined

      const input: BuyerInput = {
        appliance: {
          type: 'refrigerator', // Default to common appliance
          retailPrice: Number(retailPrice),
          askingPrice: Number(askingPrice),
        },
        damage: {
          locations: DAMAGE_MAP[damageArea],
          severity: 'moderate',
          types: ['dent', 'scratch'],
        },
        ...DEFAULT_ASSUMPTIONS,
        inspection,
      }

      const result = compile(input, { timestamp: new Date().toISOString() })
      setOutput(result)
    } catch (err) {
      console.error('Quick assess error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [retailPrice, askingPrice, damageArea, redFlag, canAnalyze])

  const reset = useCallback(() => {
    setRetailPrice('')
    setAskingPrice('')
    setDamageArea('')
    setRedFlag('none')
    setOutput(null)
  }, [])

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Search className="h-5 w-5 text-sage-600" />
        Quick Deal Check
      </h3>

      {!output ? (
        // Input Form
        <div className="mt-4 space-y-4">
          {/* Price Inputs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="qaw-retail"
                className="block text-sm font-medium text-gray-700"
              >
                Retail Price
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="qaw-retail"
                  min="0"
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(e.target.value)}
                  placeholder="0"
                  className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-sage-500 focus:outline-none focus:ring-1 focus:ring-sage-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="qaw-asking"
                className="block text-sm font-medium text-gray-700"
              >
                Asking Price
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="qaw-asking"
                  min="0"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder="0"
                  className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-sage-500 focus:outline-none focus:ring-1 focus:ring-sage-500"
                />
              </div>
            </div>
          </div>

          {/* Damage Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Where is the damage?
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { value: 'front', label: 'Front' },
                { value: 'side', label: 'Side' },
                { value: 'back_hidden', label: 'Back/Hidden' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDamageArea(value as SimplifiedDamage)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    damageArea === value
                      ? 'border-sage-500 bg-sage-50 text-sage-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Red Flags */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Any red flags found?
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { value: 'none', label: 'None' },
                { value: 'rust', label: 'Rust' },
                { value: 'water', label: 'Water Stains' },
                { value: 'odor', label: 'Odors' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRedFlag(value as RedFlag)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    redFlag === value
                      ? value === 'none'
                        ? 'border-sage-500 bg-sage-50 text-sage-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className="w-full rounded-lg bg-sage-500 py-2.5 text-sm font-medium text-white transition hover:bg-sage-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'Check This Deal'}
          </button>
        </div>
      ) : (
        // Results
        <div className="mt-4 space-y-4">
          {/* Verdict Badge */}
          {(() => {
            const config = VERDICT_CONFIG[output.verdict.recommendation]
            const Icon = config.icon
            return (
              <div
                className={`flex items-center gap-3 rounded-lg border-2 ${config.border} ${config.bg} p-4`}
              >
                <Icon className={`h-6 w-6 ${config.text}`} />
                <div>
                  <p className={`font-semibold ${config.text}`}>{config.label}</p>
                </div>
              </div>
            )
          })()}

          {/* What to clarify next */}
          <div>
            <p className="text-sm font-medium text-gray-700">
              What to clarify next:
            </p>
            <ul className="mt-2 space-y-1">
              {getClarifyingBullets(output, damageArea as SimplifiedDamage, redFlag !== 'none').map(
                (bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sage-500" />
                    {bullet}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Assumptions Note */}
          <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
            <Info className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <p className="text-xs text-gray-500">
              This quick check uses common assumptions (basic retailer warranty,
              standard returns, freestanding install).
            </p>
          </div>

          {/* CTA to Full Guide */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={getBuyersGuideUrl()}
              className="inline-flex items-center gap-1 text-sm font-medium text-sage-600 hover:text-sage-700"
            >
              Get a complete, customized analysis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={reset}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Check another deal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
