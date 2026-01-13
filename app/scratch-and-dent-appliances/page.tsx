/**
 * All States Page
 *
 * Lists all states with stores, alphabetically.
 * NO DATA ASSUMPTIONS: Renders safely with empty database.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { getStateUrl } from '@/lib/urls'
import { generateAllStatesMetadata } from '@/lib/seo'
import { getAllStates } from '@/lib/queries'

export const metadata: Metadata = generateAllStatesMetadata()

export default async function AllStatesPage() {
  // Fetch states - already ordered alphabetically by name from queries.ts
  const states = await getAllStates()

  // Calculate stats
  const totalStores = states.reduce((sum, s) => sum + s.storeCount, 0)
  const totalCities = states.reduce((sum, s) => sum + s.cityCount, 0)

  // Group states by first letter for alphabetical sections
  const statesByLetter = states.reduce(
    (acc, state) => {
      const letter = state.name[0].toUpperCase()
      if (!acc[letter]) {
        acc[letter] = []
      }
      acc[letter].push(state)
      return acc
    },
    {} as Record<string, typeof states>
  )

  const letters = Object.keys(statesByLetter).sort()

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Scratch and Dent Appliances by State
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-blue-100">
            Find scratch and dent appliance stores across the United States
          </p>

          {/* Stats */}
          <div className="mt-8 flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">
                {totalStores.toLocaleString()}
              </div>
              <div className="text-sm text-blue-200">Stores</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{states.length}/50</div>
              <div className="text-sm text-blue-200">States</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {totalCities.toLocaleString()}
              </div>
              <div className="text-sm text-blue-200">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* State Directory */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {states.length === 0 ? (
            /* Empty State */
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Directory Coming Soon
              </h2>
              <p className="mt-4 text-gray-600">
                We&apos;re building the most comprehensive directory of scratch
                and dent appliance stores. Check back soon!
              </p>
            </div>
          ) : (
            /* State Grid by Letter */
            <div className="space-y-12">
              {letters.map((letter) => (
                <div key={letter}>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    {letter}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {statesByLetter[letter].map((state) => (
                      <Link
                        key={state.id}
                        href={getStateUrl(state)}
                        className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        <span className="text-2xl">{state.emoji}</span>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {state.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {state.storeCount} stores &middot; {state.cityCount}{' '}
                            cities
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
