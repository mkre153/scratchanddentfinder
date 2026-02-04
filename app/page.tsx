/**
 * Homepage
 *
 * UX Template: /docs/ux/homepage-template.md
 *
 * Goal: Establish trust, explain what we do, route users to their state.
 * Primary user question: "Is this site useful and trustworthy?"
 *
 * STRICT SECTION ORDER:
 * 1. Hero (outcome headline, Browse States CTA, How It Works CTA)
 * 2. Trust Strip (4 bullets)
 * 3. How It Works (3 steps)
 * 4. Browse by State (grid)
 * 5. Why Use Scratch & Dent Finder (outcome-focused bullets)
 * 6. Soft CTA (suggest store)
 */

import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import { getAllStatesUrl } from '@/lib/urls'
import { generateHomepageMetadata } from '@/lib/seo'
import { getAllStates } from '@/lib/queries'
import { TrustStrip, HowItWorks, SoftCTA, AISummary } from '@/components/marketing'
import { StateGrid } from '@/components/directory'
import { Search, Zap, Scale } from 'lucide-react'
import {
  generateHowToSchema,
  JsonLd,
} from '@/lib/schema'

// Lazy load NearbyStores - below-fold, client-only (uses geolocation)
const NearbyStores = dynamic(
  () => import('@/components/directory/NearbyStores').then(mod => mod.NearbyStores),
  { ssr: false, loading: () => null }
)

export const metadata: Metadata = generateHomepageMetadata()

// HowTo schema data - explains what scratch & dent is
const HOW_IT_WORKS_STEPS = [
  {
    name: 'Minor Cosmetic Damage',
    text: 'Small dents, scratches, or packaging flaws from shipping and handling. The appliance looks slightly imperfect but functions perfectly.',
  },
  {
    name: 'Big Discounts',
    text: 'Save 20-60% off retail prices on brand-name appliances because of minor cosmetic imperfections that do not affect performance.',
  },
  {
    name: 'Fully Functional',
    text: 'Same performance and warranty coverage as new appliances. You get a brand-name appliance at a fraction of the retail price.',
  },
]

// ISR: Revalidate every 5 minutes (directory data changes infrequently)
export const revalidate = 300

export default async function HomePage() {
  // Fetch states - handles empty database gracefully
  const states = await getAllStates()

  // Calculate total store count for hero stat
  const totalStores = states.reduce((sum, state) => sum + state.storeCount, 0)

  return (
    <>
      {/* Schema Markup - HowTo only (Organization/WebSite are in root layout) */}
      <JsonLd
        data={generateHowToSchema(
          'How Scratch & Dent Appliances Work',
          'Understanding what scratch and dent appliances are and how you can save 20-60% on brand-name appliances with minor cosmetic damage.',
          HOW_IT_WORKS_STEPS
        )}
      />

      {/* Section 1: Hero */}
      <section className="bg-warm-50 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-charcoal sm:text-5xl md:text-6xl">
            Save 30-70% on Quality Appliances
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            Find scratch and dent appliance stores near you. Real local stores,
            real savings, verified listings.
          </p>

          {totalStores > 0 && (
            <p className="text-2xl font-semibold text-orange-600 mt-4">
              {totalStores.toLocaleString()}+ stores nationwide
            </p>
          )}

          {/* CTA Buttons - Primary: Browse States, Secondary: How It Works */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={getAllStatesUrl()}
              className="rounded-md bg-yellow-400 px-8 py-3 text-lg font-semibold text-gray-900 hover:bg-yellow-500"
            >
              Browse Stores by State
            </Link>
            <a
              href="#how-it-works"
              className="rounded-md border border-gray-300 bg-white px-8 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Section 2: Trust Strip */}
      <TrustStrip />

      {/* Section 2.5: Find Stores Near You (Phase 2) */}
      <NearbyStores variant="homepage" />

      {/* Section 3: How It Works */}
      <HowItWorks />

      {/* Section 4: Browse by State */}
      {states.length > 0 && <StateGrid states={states} />}

      {/* Section 5: Why Use Scratch & Dent Finder */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            Why Use Scratch & Dent Finder?
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sage-100">
                <Search className="h-5 w-5 text-sage-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Find local outlets fast
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Search by state and city to discover stores in your area.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sage-100">
                <Scale className="h-5 w-5 text-sage-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Compare multiple stores
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  See all your options in one place before you visit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sage-100">
                <Zap className="h-5 w-5 text-sage-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Avoid paying full retail
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Get brand-name appliances at a fraction of the price.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: AI Summary (AEO optimized) */}
      <AISummary />

      {/* Section 7: Soft CTA */}
      <SoftCTA variant="homepage" />

      {/* Empty State - Only show if no stores */}
      {states.length === 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Directory Coming Soon
            </h2>
            <p className="mt-4 text-gray-600">
              We&apos;re building the most comprehensive directory of scratch and
              dent appliance stores. Check back soon!
            </p>
          </div>
        </section>
      )}
    </>
  )
}
