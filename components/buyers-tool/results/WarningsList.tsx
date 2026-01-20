'use client'

/**
 * WarningsList Component
 *
 * Displays blockers and warnings from the safety gate and other modules.
 */

import type { SafetyGateResult, RuleResult } from '@/lib/buyers-tool'
import { XCircle, AlertTriangle, Info } from 'lucide-react'

interface WarningsListProps {
  safetyGate: SafetyGateResult
  allRules: RuleResult[]
}

export function WarningsList({ safetyGate, allRules }: WarningsListProps) {
  // Get failed rules by severity
  const blockers = allRules.filter(
    (r) => !r.passed && r.severity === 'blocker'
  )
  const warnings = allRules.filter(
    (r) => !r.passed && r.severity === 'warning'
  )

  const hasIssues = blockers.length > 0 || warnings.length > 0

  if (!hasIssues) {
    return (
      <div className="rounded-lg border border-sage-200 bg-sage-50 p-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-sage-600" />
          <p className="text-sm font-medium text-sage-800">
            No major concerns identified
          </p>
        </div>
        <p className="mt-1 text-sm text-sage-700">
          Based on the information provided, we didn&apos;t find any blockers or
          significant warnings.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Blockers */}
      {blockers.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="flex items-center gap-2 font-semibold text-red-800">
            <XCircle className="h-5 w-5" />
            Critical Issues ({blockers.length})
          </h4>
          <ul className="mt-3 space-y-2">
            {blockers.map((blocker) => (
              <li
                key={blocker.ruleId}
                className="flex items-start gap-2 text-sm text-red-700"
              >
                <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                {blocker.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="flex items-center gap-2 font-semibold text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Warnings ({warnings.length})
          </h4>
          <ul className="mt-3 space-y-2">
            {warnings.map((warning) => (
              <li
                key={warning.ruleId}
                className="flex items-start gap-2 text-sm text-amber-700"
              >
                <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
