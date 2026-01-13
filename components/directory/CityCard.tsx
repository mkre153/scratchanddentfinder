/**
 * CityCard Component
 *
 * Displays a city card with name and store count.
 * Uses lib/urls.ts for link generation (Gate 5).
 */

import Link from 'next/link'
import { getCityUrl } from '@/lib/urls'
import type { City, State } from '@/lib/types'

interface CityCardProps {
  city: City
  state: State
}

export function CityCard({ city, state }: CityCardProps) {
  return (
    <Link
      href={getCityUrl(state, city)}
      className="group block rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      data-testid="city-card"
    >
      <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
        {city.name}
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        {city.storeCount} {city.storeCount === 1 ? 'store' : 'stores'}
      </p>
    </Link>
  )
}
