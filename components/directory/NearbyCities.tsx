/**
 * NearbyCities Component
 *
 * Displays nearby cities (exactly 12) with links.
 * Gate 4: Exactly 12 nearby cities
 * Gate 5: Uses lib/urls.ts for link generation
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
    <section className="py-12" data-testid="nearby-cities">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Nearby Cities in {state.name}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={getCityUrl(state, city)}
              className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm transition-shadow hover:shadow-md"
              data-testid="nearby-city-link"
            >
              <span className="font-medium text-gray-900">{city.name}</span>
              <span className="text-gray-500">
                {city.storeCount} {city.storeCount === 1 ? 'store' : 'stores'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
