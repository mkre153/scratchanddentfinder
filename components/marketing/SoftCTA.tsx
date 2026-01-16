/**
 * SoftCTA Component
 *
 * Optional engagement without pressure. No popups, no email gate.
 * Used on all pages per UX template requirements.
 *
 * Variants:
 * - homepage: Get updates + Suggest a store
 * - state: Suggest a store for this state + Get updates
 * - city: Suggest a missing store + Get alerts
 */

import Link from 'next/link'
import { Plus, Bell } from 'lucide-react'
import { getStoreSubmitUrl, getContactUrl } from '@/lib/urls'

interface SoftCTAProps {
  variant: 'homepage' | 'state' | 'city'
  stateName?: string
  cityName?: string
}

export function SoftCTA({ variant, stateName, cityName }: SoftCTAProps) {
  const submitUrl = getStoreSubmitUrl()

  // Contextual copy based on variant
  const copy = {
    homepage: {
      heading: 'Help us grow the directory',
      subtext: 'Know a scratch & dent store we missed?',
      suggestLabel: 'Suggest a Store',
    },
    state: {
      heading: `Know a store in ${stateName || 'this state'}?`,
      subtext: 'Help other shoppers find great deals nearby.',
      suggestLabel: 'Suggest a Store',
    },
    city: {
      heading: `Missing a store in ${cityName || 'this city'}?`,
      subtext: "We'll add it to the directory.",
      suggestLabel: 'Suggest a Store',
    },
  }

  const { heading, subtext, suggestLabel } = copy[variant]

  return (
    <section className="border-t border-gray-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900">{heading}</h3>
          <p className="mt-1 text-sm text-gray-600">{subtext}</p>

          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={submitUrl}
              className="inline-flex items-center gap-2 rounded-md bg-sage-600 px-4 py-2 text-sm font-medium text-white hover:bg-sage-700"
            >
              <Plus className="h-4 w-4" />
              {suggestLabel}
            </Link>

            {/* Future: Email alerts signup - currently just visual placeholder */}
            {/* Uncomment when email infrastructure is ready
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Bell className="h-4 w-4" />
              Get Updates
            </button>
            */}
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Don&apos;t see a store near you?{' '}
            <Link
              href={getContactUrl()}
              className="text-sage-600 underline hover:text-sage-700"
            >
              Contact us
            </Link>{' '}
            and let us know what&apos;s missing.
          </p>
        </div>
      </div>
    </section>
  )
}
