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
 * Slice 9: List/Map toggle (read-only visualization)
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
import { CityStoreSection, NearbyCities } from '@/components/directory'
import {
  JsonLd,
  JsonLdMultiple,
  generateCityBreadcrumbs,
  generateLocalBusinessSchema,
} from '@/lib/schema'

// ISR: Revalidate every 5 minutes (directory data changes infrequently)
export const revalidate = 300

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

  // Generate LocalBusiness schemas for eligible stores (Guardrail 2)
  // Only stores with: isApproved AND address+geo AND (phone OR website)
  const storeSchemas = stores.map((store) =>
    generateLocalBusinessSchema(store, state, city)
  )

  return (
    <>
      {/* JSON-LD: BreadcrumbList → LocalBusiness (deterministic order) */}
      <JsonLd data={generateCityBreadcrumbs(state, city)} />
      <JsonLdMultiple schemas={storeSchemas} />

      {/* Hero Section */}
      <section className="bg-warm-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs items={getCityBreadcrumbs(state, city.name)} />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-charcoal sm:text-5xl">
            Scratch and Dent Appliances in {city.name}, {state.name}
          </h1>

          {/* Stats */}
          <div className="mt-8 flex gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-sage-700">{stores.length}</div>
              <div className="text-sm text-gray-500">Stores</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-sage-700">30-70%</div>
              <div className="text-sm text-gray-500">Avg Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Listings with List/Map Toggle — Slice 9 */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CityStoreSection
            stores={stores}
            cityName={city.name}
            cityCenter={{ lat: city.lat ?? 0, lng: city.lng ?? 0 }}
          />
        </div>
      </section>

      {/* Nearby Cities */}
      <NearbyCities cities={nearbyCities} state={state} currentCity={city} />
    </>
  )
}
