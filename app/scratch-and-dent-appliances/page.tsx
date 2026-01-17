/**
 * All States Page
 *
 * Lists all states with stores, alphabetically.
 * NO DATA ASSUMPTIONS: Renders safely with empty database.
 */

import type { Metadata } from 'next'
import { generateAllStatesMetadata } from '@/lib/seo'
import { getAllStates } from '@/lib/queries'
import { StateCard } from '@/components/directory'
import { JsonLd, generateAllStatesBreadcrumbs } from '@/lib/schema'

export const metadata: Metadata = generateAllStatesMetadata()

// ISR: Revalidate every 5 minutes (directory data changes infrequently)
export const revalidate = 300

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
      {/* JSON-LD: BreadcrumbList */}
      <JsonLd data={generateAllStatesBreadcrumbs()} />

      {/* Hero Section */}
      <section className="bg-warm-50 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-charcoal sm:text-5xl">
            Scratch & Dent Appliance Stores
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
            Browse stores across all 50 states
          </p>

          {/* Stats */}
          <div className="mt-8 flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-sage-700">
                {totalStores.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Stores</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sage-700">{states.length}</div>
              <div className="text-sm text-gray-500">States</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sage-700">
                {totalCities.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Cities</div>
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
                      <StateCard key={state.id} state={state} />
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
