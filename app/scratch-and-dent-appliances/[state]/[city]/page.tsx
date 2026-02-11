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
import Link from 'next/link'
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
import { CityStoreSection, NearbyCities, ExploreStateLink, CityFAQ, CityBuyingGuide } from '@/components/directory'
import { BuyerTips, SoftCTA, AISummary } from '@/components/marketing'
import { AdUnit } from '@/components/ads/AdUnit'
import dynamic from 'next/dynamic'
import { ENABLE_QUICK_ASSESS_WIDGET, ENABLE_CITY_ENRICHMENT } from '@/lib/config'

// Dynamic import: only loads QuickAssessWidget (and buyers-tool) when feature flag is ON
const QuickAssessWidget = ENABLE_QUICK_ASSESS_WIDGET
  ? dynamic(() => import('@/components/buyers-tool').then((mod) => mod.QuickAssessWidget), {
      ssr: false,
      loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100" />,
    })
  : () => null
import {
  JsonLd,
  generateCityBreadcrumbs,
  generateItemListSchema,
} from '@/lib/schema'
import { getBlogPostUrl } from '@/lib/urls'

// Evergreen blog posts shown on all city pages
const EVERGREEN_POSTS = [
  {
    slug: 'first-time-buyers-guide-scratch-and-dent',
    title: "First-Time Buyer's Guide to Scratch & Dent Appliances",
    description: 'Everything you need to know before buying your first scratch and dent appliance.',
  },
  {
    slug: 'inspecting-scratch-and-dent-appliances',
    title: 'How to Inspect Scratch & Dent Appliances',
    description: 'A step-by-step checklist for evaluating cosmetic damage vs. real problems.',
  },
  {
    slug: 'how-much-can-you-save-scratch-and-dent',
    title: 'How Much Can You Really Save on Scratch & Dent?',
    description: 'Real savings data across appliance types and store formats.',
  },
]

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

  // Fetch stores - ordered alphabetically by name from queries.ts
  const stores = await getStoresByCityId(city.id)

  // Fetch nearby cities - up to 12 (Gate 4)
  const nearbyCities = await getNearbyCities(city, 12)

  return (
    <>
      {/* JSON-LD: BreadcrumbList → ItemList (deterministic order) */}
      <JsonLd data={generateCityBreadcrumbs(state, city)} />
      <JsonLd data={generateItemListSchema(stores, state, city)} />

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

      {/* Ad: Below buyer tips */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <AdUnit slot="city-top" format="horizontal" />
      </div>

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

      {/* City Enrichment (Feature Flagged) */}
      {ENABLE_CITY_ENRICHMENT && (
        <>
          <CityFAQ stores={stores} cityName={city.name} stateName={state.name} />
          <CityBuyingGuide stores={stores} cityName={city.name} stateName={state.name} />
        </>
      )}

      {/* Ad: After store listings */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <AdUnit slot="city-bottom" format="horizontal" />
      </div>

      {/* Section 6: Soft CTA */}
      <SoftCTA variant="city" cityName={city.name} />

      {/* Section 6.5: Explore State Link (SEO upward link) */}
      <ExploreStateLink state={state} />

      {/* AI Summary (AEO optimized) */}
      <AISummary cityName={city.name} stateName={state.name} storeCount={stores.length} />

      {/* Related Blog Posts */}
      <section className="py-10 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Scratch & Dent Buying Tips
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {EVERGREEN_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={getBlogPostUrl(post.slug)}
                className="block rounded-lg bg-white p-5 border border-gray-200 hover:shadow-sm transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Nearby Cities (de-emphasized, SEO-only) */}
      <NearbyCities cities={nearbyCities} state={state} currentCity={city} />
    </>
  )
}
