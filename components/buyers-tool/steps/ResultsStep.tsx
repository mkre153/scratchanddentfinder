'use client'

/**
 * ResultsStep Component
 *
 * Final step displaying the complete analysis from the compiler.
 * Combines all result display components.
 */

import type { CompilerOutput } from '@/lib/buyers-tool'
import { VerdictCard } from '../results/VerdictCard'
import { FinancialBreakdown } from '../results/FinancialBreakdown'
import { WarningsList } from '../results/WarningsList'
import { NegotiationTips } from '../results/NegotiationTips'
import { LogisticsAdvice } from '../results/LogisticsAdvice'
import { TraceDetails } from '../results/TraceDetails'
import { RotateCcw, Share2, Info } from 'lucide-react'

interface ResultsStepProps {
  output: CompilerOutput
  onReset: () => void
}

export function ResultsStep({ output, onReset }: ResultsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Your Deal Analysis
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s our assessment based on the information you provided.
        </p>
      </div>

      {/* Disclaimer Note */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
        <p className="text-sm text-blue-800">
          These outputs reflect general patterns based on your inputs, not
          guarantees or price predictions. Actual outcomes depend on the
          specific seller and terms.
        </p>
      </div>

      {/* Main Verdict */}
      <VerdictCard verdict={output.verdict} />

      {/* Warnings & Blockers */}
      <WarningsList
        safetyGate={output.safetyGate}
        allRules={output._trace.rules}
      />

      {/* Deal Context (formerly Financial Breakdown) */}
      <FinancialBreakdown financial={output.financial} />

      {/* Negotiation Context */}
      <NegotiationTips negotiation={output.negotiation} />

      {/* Logistics */}
      <LogisticsAdvice logistics={output.logistics} />

      {/* Technical Trace (Collapsed by default) */}
      <TraceDetails trace={output._trace} />

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" />
          Analyze Another Deal
        </button>

        <button
          type="button"
          onClick={() => {
            // Copy results summary to clipboard (no dollar amounts or percentages)
            const summary = `Scratch & Dent Deal Check:
Verdict: ${output.verdict.recommendation}
${output.verdict.summary}`
            navigator.clipboard.writeText(summary)
            alert('Summary copied to clipboard!')
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4" />
          Copy Summary
        </button>
      </div>
    </div>
  )
}
