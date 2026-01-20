/**
 * City Page
 *
 * UX Template: /docs/ux/city-template.md
 *
 * Goal: Enable fast action by showing local stores and reducing buyer hesitation.
 * Primary user question: "Where can I go right now to buy a discounted appliance?"
 *
 * STRICT SECTION ORDER:
 * 1. City Hero (smaller, city + category headline)
 * 2. Quick Deal Check Widget (above fold, high visibility)
 * 3. Buyer Tips (max 3 bullets)
 * 4. Local Context (optional, 2-3 sentences)
 * 5. Store Listings (tap-to-call)
 * 6. Soft CTA (suggest store)
 * 7. Nearby Cities (de-emphasized, SEO-only)
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
import { CityStoreSection, NearbyCities, ExploreStateLink } from '@/components/directory'
import { BuyerTips, SoftCTA } from '@/components/marketing'
import dynamic from 'next/dynamic'
import { ENABLE_QUICK_ASSESS_WIDGET } from '@/lib/config'

// Dynamic import: only loads QuickAssessWidget (and buyers-tool) when feature flag is ON
const QuickAssessWidget = ENABLE_QUICK_ASSESS_WIDGET
  ? dynamic(() => import('@/components/buyers-tool').then((mod) => mod.QuickAssessWidget), {
      ssr: false,
      loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100" />,
    })
  : () => null
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

  // Fetch nearby cities - up to 12 (Gate 4)
  const nearbyCities = await getNearbyCities(city, 12)

  // Generate LocalBusiness schemas for eligible stores (Guardrail 2)
  const storeSchemas = stores.map((store) =>
    generateLocalBusinessSchema(store, state, city)
  )

  return (
    <>
      {/* JSON-LD: BreadcrumbList → LocalBusiness (deterministic order) */}
      <JsonLd data={generateCityBreadcrumbs(state, city)} />
      <JsonLdMultiple schemas={storeSchemas} />

      {/* Section 1: City Hero (smaller than state hero) */}
      <section className="bg-warm-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <Breadcrumbs items={getCityBreadcrumbs(state, city.name)} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            Scratch & Dent Appliances in {city.name}, {state.name}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {stores.length > 0
              ? `${stores.length} local ${stores.length === 1 ? 'store' : 'stores'} with discounted appliances.`
              : 'Find discounted appliances with minor cosmetic damage.'}
          </p>
          {ENABLE_QUICK_ASSESS_WIDGET && (
            <p className="mt-3 text-sm text-gray-500">
              Not sure if it's a good deal?{' '}
              <a href="#quick-deal-check" className="text-rust hover:underline">
                Quick check ↓
              </a>
            </p>
          )}
        </div>
      </section>

      {/* Section 2: Quick Deal Check Widget (Feature Flagged) */}
      {ENABLE_QUICK_ASSESS_WIDGET && (
        <section id="quick-deal-check" className="bg-gray-50 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-center text-xl font-bold text-gray-900">
              Quick Deal Check
            </h2>
            <div className="mx-auto max-w-md">
              <QuickAssessWidget />
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Buyer Tips */}
      <BuyerTips />

      {/* Section 4: Local Context */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="max-w-2xl text-sm text-gray-600">
            {city.name} shoppers can find scratch and dent deals at local outlets
            and appliance liquidation stores. Inventory changes frequently, so
            checking in regularly and calling ahead can help you find the best
            selection.
          </p>
        </div>
      </section>

      {/* Section 5: Store Listings */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CityStoreSection
            stores={stores}
            cityName={city.name}
            cityCenter={{ lat: city.lat ?? 0, lng: city.lng ?? 0 }}
          />
        </div>
      </section>

      {/* Section 6: Soft CTA */}
      <SoftCTA variant="city" cityName={city.name} />

      {/* Section 6.5: Explore State Link (SEO upward link) */}
      <ExploreStateLink state={state} />

      {/* Section 7: Nearby Cities (de-emphasized, SEO-only) */}
      <NearbyCities cities={nearbyCities} state={state} currentCity={city} />
    </>
  )
}
