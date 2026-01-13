/**
 * State Page
 *
 * Lists all cities in a state with stores.
 * NO DATA ASSUMPTIONS: Renders safely with empty database.
 * Uses lib/urls.ts for all route generation (Gate 5).
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateStateMetadata } from '@/lib/seo'
import { getStateBySlug, getCitiesByStateId } from '@/lib/queries'
import {
  Breadcrumbs,
  getStateBreadcrumbs,
} from '@/components/layout/Breadcrumbs'
import { CityCard } from '@/components/directory'

interface PageProps {
  params: Promise<{ state: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { state: stateSlug } = await params
  const state = await getStateBySlug(stateSlug)

  if (!state) {
    return { title: 'State Not Found' }
  }

  return generateStateMetadata(state)
}

export default async function StatePage({ params }: PageProps) {
  const { state: stateSlug } = await params
  const state = await getStateBySlug(stateSlug)

  if (!state) {
    notFound()
  }

  // Fetch cities - ordered by store_count DESC, name ASC from queries.ts
  const cities = await getCitiesByStateId(state.id)

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs items={getStateBreadcrumbs(state.name)} />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {state.emoji} {state.name}
          </h1>
          <p className="mt-4 text-xl text-blue-100">
            Scratch & Dent Appliance Directory
          </p>

          {/* Stats */}
          <div className="mt-8 flex gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">{state.storeCount}</div>
              <div className="text-sm text-blue-200">Stores</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{state.cityCount}</div>
              <div className="text-sm text-blue-200">Cities</div>
            </div>
            <div>
              <div className="text-3xl font-bold">30-70%</div>
              <div className="text-sm text-blue-200">Avg Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* City Directory */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">
            Cities in {state.name}
          </h2>

          {cities.length === 0 ? (
            /* Empty State */
            <div className="text-center">
              <p className="text-gray-600">
                No cities with stores found yet in {state.name}. Check back
                soon!
              </p>
            </div>
          ) : (
            /* City Grid */
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {cities.map((city) => (
                <CityCard key={city.id} city={city} state={state} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
