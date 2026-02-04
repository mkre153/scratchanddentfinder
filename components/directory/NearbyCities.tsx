/**
 * NearbyCities Component
 *
 * UX Template: /docs/ux/city-template.md (Section 6)
 *
 * Displays nearby cities as plain text links (de-emphasized, SEO-only).
 * Gate 4: Up to 12 nearby cities
 * Gate 5: Uses lib/urls.ts for link generation
 *
 * Template constraints:
 * - Visually de-emphasized
 * - No cards (plain links only)
 * - No descriptions
 * - Must not compete with primary content
 */

import Link from 'next/link'
import { getCityUrl } from '@/lib/urls'
import type { City, State } from '@/lib/types'

interface NearbyCitiesProps {
  cities: City[]
  state: State
  currentCity: City
}

export function NearbyCities({ cities, state, currentCity }: NearbyCitiesProps) {
  if (cities.length === 0) {
    return null
  }

  return (
    <section
      className="border-t border-gray-100 py-8"
      data-testid="nearby-cities"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-sm font-medium text-gray-500">
          Other Cities in {state.name}
        </h2>

        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={getCityUrl(state, city)}
              className="text-sm text-gray-600 hover:text-sage-700 hover:underline"
              data-testid="nearby-city-link"
            >
              {city.name} ({city.storeCount})
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
