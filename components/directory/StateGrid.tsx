/**
 * StateGrid Component
 *
 * Displays all states as a responsive grid of links.
 * Used on Homepage per UX template requirements.
 *
 * Template spec: Grid/list layout, links to /scratch-and-dent-appliances/[state]/
 */

import Link from 'next/link'
import type { State } from '@/lib/types'
import { getStateUrl } from '@/lib/urls'

interface StateGridProps {
  states: State[]
}

export function StateGrid({ states }: StateGridProps) {
  if (states.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Browse by State
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {states.map((state) => (
            <Link
              key={state.id}
              href={getStateUrl(state)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-sage-300 hover:bg-sage-50 hover:text-sage-800"
            >
              <span>{state.emoji}</span>
              <span className="truncate">{state.name}</span>
              <span className="ml-auto text-xs text-gray-400">
                {state.storeCount}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
