/**
 * State Page
 *
 * UX Template: /docs/ux/state-template.md
 *
 * Goal: Confirm relevance, explain scratch-and-dent locally, route to cities/stores.
 * Primary user question: "Is this relevant where I live?"
 *
 * STRICT SECTION ORDER:
 * 1. State Hero (headline, Browse Stores CTA, How It Works CTA)
 * 2. Trust Strip (4 bullets)
 * 3. Quick Deal Check Widget (above fold, high visibility)
 * 4. Short Explainer (2-3 sentences)
 * 5. City Navigation (top cities)
 * 6. Store Listings (statewide)
 * 7. State Buying Guide (1 paragraph)
 * 8. Soft CTA (suggest store)
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateStateMetadata } from '@/lib/seo'
import {
  getStateBySlug,
  getCitiesByStateId,
  getStoresByStateId,
} from '@/lib/queries'
import {
  Breadcrumbs,
  getStateBreadcrumbs,
} from '@/components/layout/Breadcrumbs'
import { CitySearchSection, StoreCard } from '@/components/directory'
import { TrustStrip, SoftCTA } from '@/components/marketing'
import dynamic from 'next/dynamic'
import { JsonLd, generateStateBreadcrumbs } from '@/lib/schema'
import { ENABLE_QUICK_ASSESS_WIDGET } from '@/lib/config'

// Dynamic import: only loads QuickAssessWidget (and buyers-tool) when feature flag is ON
const QuickAssessWidget = ENABLE_QUICK_ASSESS_WIDGET
  ? dynamic(() => import('@/components/buyers-tool').then((mod) => mod.QuickAssessWidget), {
      ssr: false,
      loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100" />,
    })
  : () => null

// ISR: Revalidate every 5 minutes (directory data changes infrequently)
export const revalidate = 300

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

  // Fetch cities and stores in parallel
  const [cities, stores] = await Promise.all([
    getCitiesByStateId(state.id),
    getStoresByStateId(state.id),
  ])

  return (
    <>
      {/* JSON-LD: BreadcrumbList */}
      <JsonLd data={generateStateBreadcrumbs(state)} />

      {/* Section 1: State Hero */}
      <section className="bg-warm-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs items={getStateBreadcrumbs(state.name)} />
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-charcoal sm:text-5xl">
            Scratch & Dent Appliances in {state.name}
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Find discounted appliances at {state.storeCount} local stores across{' '}
            {state.cityCount} cities.
          </p>
          {ENABLE_QUICK_ASSESS_WIDGET && (
            <p className="mt-3 text-sm text-gray-500">
              Not sure if it's a good deal?{' '}
              <a href="#quick-deal-check" className="text-rust hover:underline">
                Quick check ↓
              </a>
            </p>
          )}

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="#stores"
              className="rounded-md bg-yellow-400 px-6 py-3 text-center font-semibold text-gray-900 hover:bg-yellow-500"
            >
              Browse {state.storeCount} Stores
            </a>
            <a
              href="#how-it-works"
              className="rounded-md border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
            >
              How Scratch & Dent Works
            </a>
          </div>
        </div>
      </section>

      {/* Section 2: Trust Strip */}
      <TrustStrip />

      {/* Section 3: Quick Deal Check Widget (Feature Flagged) */}
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

      {/* Section 4: Short Explainer */}
      <section className="py-10" id="how-it-works">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-gray-700">
              Scratch and dent appliances are brand-new units with minor cosmetic
              imperfections—a small dent, scuff, or packaging damage—that don&apos;t
              affect performance. Most come with full manufacturer warranties and
              deliver the same reliability as retail-priced models, but at 20–60%
              less.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: City Navigation */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            All {state.name} Cities with Scratch & Dent Stores
          </h2>
          <p className="mb-6 text-gray-600">
            Search and browse cities to find detailed store listings and contact information
          </p>

          {cities.length === 0 ? (
            <p className="text-gray-600">
              No cities with stores found yet in {state.name}. Check back soon!
            </p>
          ) : (
            <CitySearchSection cities={cities} state={state} />
          )}
        </div>
      </section>

      {/* Section 6: Store Listings (Statewide) */}
      <section className="bg-gray-50 py-10" id="stores">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            All Stores in {state.name}
          </h2>

          {stores.length === 0 ? (
            <p className="text-gray-600">
              No stores found yet in {state.name}. Check back soon!
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 7: State Buying Guide */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Buying Scratch & Dent in {state.name}
          </h2>
          <p className="max-w-3xl text-sm text-gray-600">
            {state.name} has a healthy market for scratch and dent appliances,
            with outlets and liquidation stores in most metro areas. Inventory
            turns over quickly—especially for refrigerators, washers, and
            dryers—so visiting stores in person and checking back regularly can
            help you find the best deals. Many {state.name} dealers offer delivery
            and installation.
          </p>
        </div>
      </section>

      {/* Section 8: Soft CTA */}
      <SoftCTA variant="state" stateName={state.name} />
    </>
  )
}
