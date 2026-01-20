/**
 * CitySearchCard Component
 *
 * Enhanced card for city search results with store count badge and CTA.
 * Used in CitySearchSection for state pages.
 * Uses lib/urls.ts for link generation (Gate 5).
 */

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getCityUrl } from '@/lib/urls'
import type { City, State } from '@/lib/types'

interface CitySearchCardProps {
  city: City
  state: State
}

export function CitySearchCard({ city, state }: CitySearchCardProps) {
  return (
    <Link
      href={getCityUrl(state, city)}
      className="block rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      data-testid="city-search-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{city.name}</h3>
          <p className="text-sm text-gray-500">{state.name}</p>
        </div>
        <div className="text-right">
          <span
            aria-label={`${city.storeCount} scratch and dent stores in ${city.name}`}
            className="text-xl font-bold text-blue-600"
          >
            {city.storeCount}
          </span>
          <p className="text-xs text-gray-500">stores</p>
        </div>
      </div>
      <p className="mt-3 flex items-center text-sm font-medium text-blue-600">
        View Scratch &amp; Dent Stores
        <ChevronRight className="ml-1 h-4 w-4" />
      </p>
    </Link>
  )
}
