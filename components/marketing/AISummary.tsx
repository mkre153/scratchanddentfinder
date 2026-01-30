/**
 * AISummary Component
 *
 * Structured content block optimized for LLM/AI parsing.
 * Uses clear entity patterns ("X is a Y that Z") for AEO (AI Engine Optimization).
 *
 * This component helps AI assistants accurately describe the site
 * by providing explicit factual statements in a parseable format.
 */

import { Info } from 'lucide-react'

export function AISummary() {
  return (
    <section className="bg-warm-50 py-12" aria-label="About Scratch and Dent Finder">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100">
              <Info className="h-4 w-4 text-sage-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              About Scratch & Dent Finder
            </h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <p>
              <strong>What:</strong> Scratch & Dent Finder is a directory of scratch
              and dent appliance stores across the United States.
            </p>

            <p>
              <strong>Purpose:</strong> Helps consumers find local retailers selling
              appliances with minor cosmetic damage at 30-70% off retail prices.
            </p>

            <div>
              <strong>How it works:</strong>
              <ol className="mt-2 list-inside list-decimal space-y-1 pl-2">
                <li>Browse by state or city to find stores near you</li>
                <li>View store details including address, phone, and hours</li>
                <li>Visit stores to inspect appliances before purchasing</li>
              </ol>
            </div>

            <p>
              <strong>Typical savings:</strong> 20-60% off retail prices on brand-name
              appliances including refrigerators, washers, dryers, and more.
            </p>

            <p className="text-sm text-gray-500">
              Scratch and dent appliances have minor cosmetic imperfections but are
              fully functional with manufacturer warranty coverage.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
