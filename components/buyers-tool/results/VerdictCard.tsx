'use client'

/**
 * VerdictCard Component
 *
 * Displays the main verdict (PROCEED/CAUTION/SKIP/WALK_AWAY) with color coding.
 */

import type { VerdictResult, Recommendation } from '@/lib/buyers-tool'
import { CheckCircle, AlertTriangle, XCircle, ShieldX } from 'lucide-react'

const VERDICT_CONFIG: Record<
  Recommendation,
  {
    bg: string
    border: string
    text: string
    heading: string
    icon: typeof CheckCircle
  }
> = {
  PROCEED: {
    bg: 'bg-sage-50',
    border: 'border-sage-500',
    text: 'text-sage-700',
    heading: 'Good Deal',
    icon: CheckCircle,
  },
  PROCEED_WITH_CAUTION: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    text: 'text-amber-700',
    heading: 'Proceed with Caution',
    icon: AlertTriangle,
  },
  SKIP: {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-700',
    heading: 'Consider Skipping',
    icon: XCircle,
  },
  WALK_AWAY: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-700',
    heading: 'Walk Away',
    icon: ShieldX,
  },
}

interface VerdictCardProps {
  verdict: VerdictResult
}

export function VerdictCard({ verdict }: VerdictCardProps) {
  const config = VERDICT_CONFIG[verdict.recommendation]
  const Icon = config.icon

  return (
    <div
      className={`rounded-xl border-2 ${config.border} ${config.bg} p-6`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}
        >
          <Icon className={`h-8 w-8 ${config.text}`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${config.text}`}>
            {config.heading}
          </h3>
          <p className="mt-2 text-gray-700">{verdict.summary}</p>
          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}
            >
              Confidence:{' '}
              <span className="capitalize">{verdict.confidence}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
