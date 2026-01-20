'use client'

/**
 * StateSearchSection Component
 *
 * Client component for filtering states on the all-states page.
 * All states are server-rendered in the initial HTML for SEO.
 * Search is client-side UX enhancement only (no URL params).
 * Preserves A-Z alphabetical grouping after filtering.
 */

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { StateCard } from './StateCard'
import type { State } from '@/lib/types'

interface StateSearchSectionProps {
  states: State[]
}

export function StateSearchSection({ states }: StateSearchSectionProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return states
    return states.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase().trim())
    )
  }, [states, query])

  // Group filtered states by first letter (preserve A-Z organization)
  const statesByLetter = useMemo(() => {
    const grouped = filtered.reduce(
      (acc, state) => {
        const letter = state.name[0].toUpperCase()
        if (!acc[letter]) acc[letter] = []
        acc[letter].push(state)
        return acc
      },
      {} as Record<string, State[]>
    )

    // Sort states within each letter group for stable ordering
    Object.keys(grouped).forEach((letter) => {
      grouped[letter].sort((a, b) => a.name.localeCompare(b.name))
    })

    return grouped
  }, [filtered])

  const letters = Object.keys(statesByLetter).sort()

  return (
    <div>
      {/* Search Box */}
      <div className="mx-auto mb-8 max-w-xl rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Search className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">Find Your State</span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a state (e.g., California, New York...)"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10
                       focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
          />
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>

        <p className="mt-3 text-center text-sm text-gray-500">
          All states are listed alphabetically below for easy browsing
        </p>
      </div>

      {/* State Grid by Letter */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-600">
          No states found. Try a different search.
        </p>
      ) : (
        <div className="space-y-12">
          {letters.map((letter) => (
            <div key={letter}>
              <h2 className="mb-6 text-2xl font-bold text-gray-900">{letter}</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {statesByLetter[letter].map((state) => (
                  <StateCard key={state.id} state={state} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
