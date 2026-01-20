'use client'

/**
 * NegotiationTips Component
 *
 * Displays negotiation context and behavioral guidance.
 * Reframed to guide behavior, not predict results.
 */

import type { NegotiationResult, NegotiationProbability } from '@/lib/buyers-tool'
import { MessageSquare, Lightbulb } from 'lucide-react'

// Map probability to qualitative context labels
const CONTEXT_CONFIG: Record<
  NegotiationProbability,
  { label: string; color: string }
> = {
  high: { label: 'Favorable', color: 'text-sage-700' },
  medium: { label: 'Mixed', color: 'text-amber-600' },
  low: { label: 'Uncertain', color: 'text-orange-600' },
  unlikely: { label: 'Uncertain', color: 'text-red-600' },
}

interface NegotiationTipsProps {
  negotiation: NegotiationResult
}

export function NegotiationTips({ negotiation }: NegotiationTipsProps) {
  const contextConfig = CONTEXT_CONFIG[negotiation.probability]

  if (!negotiation.possible) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">
            Limited negotiation context
          </p>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Based on the retailer type, price discussions may not be typical for
          this purchase. Focus on clarifying warranty and return terms instead.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <MessageSquare className="h-5 w-5 text-sage-600" />
        Negotiation Context
      </h3>

      <div className="mt-4 space-y-4">
        {/* Context Indicator */}
        <div className="rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500">Conditions for Discussion</p>
          <p className={`mt-1 font-semibold ${contextConfig.color}`}>
            {contextConfig.label}
          </p>
        </div>

        {/* Starting Offer Consideration */}
        {negotiation.suggestedTargetPrice && (
          <div className="rounded-lg bg-sage-50 px-4 py-3">
            <p className="text-xs text-sage-600">Starting Offer to Consider</p>
            <p className="mt-1 text-sm text-sage-700">
              This condition may support a conversation about price. If you
              choose to negotiate, consider starting below the listed price and
              working toward a middle ground.
            </p>
          </div>
        )}

        {/* Leverage Points → Conversation Points */}
        {negotiation.leveragePoints.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Points to Consider Mentioning
            </h4>
            <ul className="mt-2 space-y-1">
              {negotiation.leveragePoints.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sage-500" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternative Asks → Non-Price Considerations */}
        {negotiation.alternativeAsks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              If price is firm, consider asking about:
            </h4>
            <ul className="mt-2 space-y-1">
              {negotiation.alternativeAsks.map((ask, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  {ask}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Behavioral Guidance */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            <strong>Remember:</strong> Clarify warranty and return terms before
            discussing numbers. Be prepared to walk away if terms don&apos;t
            align with your needs.
          </p>
        </div>
      </div>
    </div>
  )
}
