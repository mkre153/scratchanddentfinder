/**
 * StateCard Component
 *
 * Displays a state card with emoji, name, store count, and city count.
 * Uses lib/urls.ts for link generation (Gate 5).
 */

import Link from 'next/link'
import { getStateUrl } from '@/lib/urls'
import type { State } from '@/lib/types'

interface StateCardProps {
  state: State
}

export function StateCard({ state }: StateCardProps) {
  return (
    <Link
      href={getStateUrl(state)}
      className="group block rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
      data-testid="state-card"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl" role="img" aria-label={state.name}>
          {state.emoji}
        </span>
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
            {state.name}
          </h3>
          <p className="text-sm text-gray-600">
            {state.storeCount} {state.storeCount === 1 ? 'store' : 'stores'} in{' '}
            {state.cityCount} {state.cityCount === 1 ? 'city' : 'cities'}
          </p>
        </div>
      </div>
    </Link>
  )
}
