'use client'

/**
 * CitySearchSection Component
 *
 * Client component for filtering cities on individual state pages.
 * All cities are server-rendered in the initial HTML for SEO.
 * Search is client-side UX enhancement only (no URL params).
 */

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { CitySearchCard } from './CitySearchCard'
import type { City, State } from '@/lib/types'

interface CitySearchSectionProps {
  cities: City[]
  state: State
}

export function CitySearchSection({ cities, state }: CitySearchSectionProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return cities
    return cities.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase().trim())
    )
  }, [cities, query])

  return (
    <div>
      {/* Search Box */}
      <div className="mx-auto mb-8 max-w-xl rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Search className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">
            Find Cities in {state.name}
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${state.name} cities...`}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10
                       focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
          />
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>

        <p className="mt-3 text-center text-sm text-gray-500">
          All {cities.length} cities with scratch and dent stores listed below
        </p>
      </div>

      {/* City Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-600">
          No cities found. Try a different search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((city) => (
            <CitySearchCard key={city.id} city={city} state={state} />
          ))}
        </div>
      )}
    </div>
  )
}
