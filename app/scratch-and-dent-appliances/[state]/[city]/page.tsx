/**
 * City Page
 *
 * Shows stores in a city with nearby cities.
 * NO DATA ASSUMPTIONS: Renders safely with empty database.
 * Uses lib/urls.ts for all route generation (Gate 5).
 *
 * Slice 1: Basic structure only
 * Slice 2: StoreCard, NearbyCities components
 * Slice 3: Lead tracking CTAs
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateCityMetadata } from '@/lib/seo'
import {
  getStateBySlug,
  getCityBySlug,
  getStoresByCityId,
  getNearbyCities,
} from '@/lib/queries'
import {
  Breadcrumbs,
  getCityBreadcrumbs,
} from '@/components/layout/Breadcrumbs'
import { StoreCard, NearbyCities } from '@/components/directory'

interface PageProps {
  params: Promise<{ state: string; city: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params
  const state = await getStateBySlug(stateSlug)

  if (!state) {
    return { title: 'City Not Found' }
  }

  const city = await getCityBySlug(state.slug, citySlug)

  if (!city) {
    return { title: 'City Not Found' }
  }

  return generateCityMetadata(city, state)
}

export default async function CityPage({ params }: PageProps) {
  const { state: stateSlug, city: citySlug } = await params
  const state = await getStateBySlug(stateSlug)

  if (!state) {
    notFound()
  }

  const city = await getCityBySlug(state.slug, citySlug)

  if (!city) {
    notFound()
  }

  // Fetch stores - ordered by is_featured DESC, name ASC from queries.ts
  const stores = await getStoresByCityId(city.id)

  // Fetch nearby cities - exactly 12 (Gate 4)
  const nearbyCities = await getNearbyCities(city, 12)

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs items={getCityBreadcrumbs(state, city.name)} />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Scratch and Dent Appliances in {city.name}, {state.name}
          </h1>

          {/* Stats */}
          <div className="mt-8 flex gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">{stores.length}</div>
              <div className="text-sm text-blue-200">Stores</div>
            </div>
            <div>
              <div className="text-3xl font-bold">30-70%</div>
              <div className="text-sm text-blue-200">Avg Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Listings */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">
            Stores in {city.name}
          </h2>

          {stores.length === 0 ? (
            /* Empty State */
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                No stores listed yet
              </h3>
              <p className="mt-2 text-gray-600">
                Know a scratch and dent appliance store in {city.name}? Help us
                grow our directory!
              </p>
            </div>
          ) : (
            /* Store List */
            <div className="space-y-4">
              {stores.map((store, index) => (
                <StoreCard key={store.id} store={store} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Nearby Cities */}
      <NearbyCities cities={nearbyCities} state={state} currentCity={city} />
    </>
  )
}
