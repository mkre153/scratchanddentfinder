/**
 * All States Page
 *
 * Lists all states with stores, alphabetically.
 * NO DATA ASSUMPTIONS: Renders safely with empty database.
 */

import type { Metadata } from 'next'
import { generateAllStatesMetadata } from '@/lib/seo'
import { getAllStates } from '@/lib/queries'
import { StateSearchSection } from '@/components/directory'
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
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Discount Appliance Outlets by State A-Z
          </h2>
          <p className="mb-8 text-center text-gray-600">
            Browse scratch and dent appliance stores, damaged appliance dealers, and factory seconds outlets in your state
          </p>

          {states.length === 0 ? (
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">
                Directory Coming Soon
              </h3>
              <p className="mt-4 text-gray-600">
                We&apos;re building the most comprehensive directory of scratch
                and dent appliance stores. Check back soon!
              </p>
            </div>
          ) : (
            <StateSearchSection states={states} />
          )}
        </div>
      </section>
    </>
  )
}
