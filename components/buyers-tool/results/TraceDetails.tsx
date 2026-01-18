'use client'

/**
 * TraceDetails Component
 *
 * Expandable section showing the execution trace for advanced users.
 * Displays all rules that were evaluated and their results.
 */

import { useState } from 'react'
import type { CompilerTrace, RuleResult } from '@/lib/buyers-tool'
import { ChevronDown, ChevronUp, Code, CheckCircle, XCircle, Info } from 'lucide-react'

interface TraceDetailsProps {
  trace: CompilerTrace
}

export function TraceDetails({ trace }: TraceDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Group rules by module
  const rulesByModule = new Map<string, RuleResult[]>()
  for (const rule of trace.rules) {
    const module = rule.ruleId.split('_')[0] ?? 'OTHER'
    const existing = rulesByModule.get(module) ?? []
    rulesByModule.set(module, [...existing, rule])
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Code className="h-4 w-4" />
          Technical Details
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          {/* Version Info */}
          <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-500">
            <span>Compiler: {trace.compilerVersion}</span>
            <span>Schema: {trace.schemaVersion}</span>
            <span>Ruleset: {trace.rulesetVersion}</span>
          </div>

          {/* Execution Order */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600">Execution Order</p>
            <p className="mt-1 font-mono text-xs text-gray-500">
              {trace.executionOrder.join(' → ')}
            </p>
            {trace.haltedAtModule && (
              <p className="mt-1 text-xs text-red-600">
                Halted at: {trace.haltedAtModule} (Rule: {trace.haltedByRuleId})
              </p>
            )}
          </div>

          {/* Rules by Module */}
          <div className="space-y-3">
            {Array.from(rulesByModule.entries()).map(([module, rules]) => (
              <div key={module}>
                <p className="text-xs font-medium uppercase text-gray-500">
                  {module}
                </p>
                <ul className="mt-1 space-y-1">
                  {rules.map((rule) => (
                    <li
                      key={rule.ruleId}
                      className="flex items-start gap-2 font-mono text-xs"
                    >
                      {rule.passed ? (
                        <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-sage-500" />
                      ) : rule.severity === 'blocker' ? (
                        <XCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-500" />
                      ) : rule.severity === 'warning' ? (
                        <XCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-500" />
                      ) : (
                        <Info className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-400" />
                      )}
                      <span
                        className={
                          rule.passed
                            ? 'text-gray-600'
                            : rule.severity === 'blocker'
                              ? 'text-red-700'
                              : rule.severity === 'warning'
                                ? 'text-amber-700'
                                : 'text-gray-500'
                        }
                      >
                        {rule.ruleId}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Input Hash */}
          <p className="mt-4 text-xs text-gray-400">
            Input Hash: {trace.inputHash}
          </p>
        </div>
      )}
    </div>
  )
}
