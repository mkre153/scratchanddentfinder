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
import { getAllStatesUrl, getBlogUrl, getBlogPostUrl, getReviewsUrl, getReviewUrl } from '@/lib/urls'
import { generateHomepageMetadata } from '@/lib/seo'
import { getAllStates, getActiveDeals } from '@/lib/queries'
import { ENABLE_DEALS } from '@/lib/config'
import { TrustStrip, HowItWorks, SoftCTA, AISummary } from '@/components/marketing'
import { StateGrid, USMapSection } from '@/components/directory'
import { PopularTypes } from '@/components/home/PopularTypes'
import { LatestDeals } from '@/components/home/LatestDeals'
import { Search, Zap, Scale } from 'lucide-react'
import {
  generateHowToSchema,
  generateFAQPageSchema,
  JsonLd,
} from '@/lib/schema'

import { AdUnit } from '@/components/ads/AdUnit'
import { FAQ_ITEMS } from '@/components/home/faq-data'
import { HomeFAQ } from '@/components/home/HomeFAQ'
import { NewsletterSignup } from '@/components/home/NewsletterSignup'

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

// Types for velite content
interface Post {
  slug: string
  title: string
  description: string
  date: string
  updated: string
  category: string
  draft: boolean
  readingTime: string
}

async function getRecentPosts(): Promise<Post[]> {
  try {
    const { posts } = await import('../.velite/index.js')
    return (posts as Post[])
      .filter((p) => !p.draft)
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
      .slice(0, 3)
  } catch {
    return []
  }
}

interface ReviewSource {
  videoId: string
}

interface Review {
  slug: string
  title: string
  description: string
  updated: string
  category: string
  draft: boolean
  readingTime: string
  sources: ReviewSource[]
}

async function getRecentReviews(): Promise<Review[]> {
  try {
    const { reviews } = await import('../.velite/index.js')
    return (reviews as Review[])
      .filter((r) => !r.draft)
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
      .slice(0, 3)
  } catch {
    return []
  }
}

// ISR: Revalidate every 5 minutes (directory data changes infrequently)
export const revalidate = 300

export default async function HomePage() {
  // Fetch states - handles empty database gracefully
  const states = await getAllStates()
  const recentPosts = await getRecentPosts()
  const recentReviews = await getRecentReviews()

  // Fetch latest deals if feature enabled
  let latestDeals: Awaited<ReturnType<typeof getActiveDeals>>['deals'] = []
  if (ENABLE_DEALS) {
    try {
      const { deals } = await getActiveDeals({ limit: 3 })
      latestDeals = deals
    } catch {
      // Deals fetch failure shouldn't break the homepage
    }
  }

  // Calculate total store count for hero stat
  const totalStores = states.reduce((sum, state) => sum + state.storeCount, 0)
  const totalCities = states.reduce((sum, state) => sum + (state.cityCount ?? 0), 0)

  return (
    <>
      {/* Schema Markup - HowTo + FAQ (Organization/WebSite are in root layout) */}
      <JsonLd
        data={generateHowToSchema(
          'How Scratch & Dent Appliances Work',
          'Understanding what scratch and dent appliances are and how you can save 20-60% on brand-name appliances with minor cosmetic damage.',
          HOW_IT_WORKS_STEPS
        )}
      />
      <JsonLd data={generateFAQPageSchema(FAQ_ITEMS)} />

      {/* Section 1: Hero */}
      <section className="bg-warm-50 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-charcoal sm:text-5xl md:text-6xl">
            Save 30-70% on Quality Appliances
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            Find scratch and dent appliance stores near you. Verified local stores.
          </p>

          {totalStores > 0 && (
            <p className="text-lg font-semibold text-orange-600 mt-4">
              {totalStores.toLocaleString()}+ stores across {totalCities.toLocaleString()} cities in all 50 states
            </p>
          )}

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={getAllStatesUrl()}
              className="rounded-md bg-yellow-400 px-8 py-3 text-lg font-semibold text-gray-900 hover:bg-yellow-500"
            >
              Browse Stores by State
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Trust Strip */}
      <TrustStrip />

      {/* Section 2.5: Find Stores Near You (Phase 2) */}
      <NearbyStores variant="homepage" />

      {/* Ad: homepage-mid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdUnit slot="homepage-mid" format="horizontal" />
      </div>

      {/* Section 3: How It Works */}
      <HowItWorks />

      {/* Section 3.5: Interactive US Map */}
      {states.length > 0 && <USMapSection states={states} />}

      {/* Section 4: Browse by State */}
      {states.length > 0 && <StateGrid states={states} />}

      {/* Section 4.5: Popular Appliance Types */}
      <PopularTypes />

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

      {/* Section 6: Latest from the Blog */}
      {recentPosts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Latest Savings Tips
              </h2>
              <Link
                href={getBlogUrl()}
                className="text-sm font-medium text-sage-700 hover:text-sage-800"
              >
                View all posts &rarr;
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={getBlogPostUrl(post.slug)}
                  className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      {new Date(post.updated).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{post.readingTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 6.5: Featured Reviews */}
      {recentReviews.length > 0 && (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Reviews
              </h2>
              <Link
                href={getReviewsUrl()}
                className="text-sm font-medium text-sage-700 hover:text-sage-800"
              >
                View all reviews &rarr;
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {recentReviews.map((review) => (
                <Link
                  key={review.slug}
                  href={getReviewUrl(review.slug)}
                  className="block rounded-lg bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                >
                  {review.sources[0]?.videoId && (
                    <img
                      src={`https://img.youtube.com/vi/${review.sources[0].videoId}/mqdefault.jpg`}
                      alt={review.title}
                      className="w-full aspect-video object-cover"
                    />
                  )}
                  <div className="p-6">
                    <span className="inline-block text-xs font-medium text-sage-700 bg-sage-100 px-2 py-0.5 rounded mb-2">
                      {review.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {review.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {review.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        {new Date(review.updated).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{review.readingTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 7: Latest Deals */}
      {ENABLE_DEALS && latestDeals.length > 0 && (
        <LatestDeals deals={latestDeals} />
      )}

      {/* Appliance Deals - Amazon Affiliate */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Shop Scratch &amp; Dent Deals</h2>
              <p className="text-sm text-gray-500 mt-1">Save 20–60% on brand-name appliances</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { type: 'Refrigerators', savings: '30–50%', emoji: '🧊', url: 'https://www.amazon.com/s?k=scratch+and+dent+refrigerator&tag=scratchanddentfinder-20' },
              { type: 'Washing Machines', savings: '25–40%', emoji: '🫧', url: 'https://www.amazon.com/s?k=scratch+and+dent+washing+machine&tag=scratchanddentfinder-20' },
              { type: 'Dryers', savings: '25–40%', emoji: '💨', url: 'https://www.amazon.com/s?k=scratch+and+dent+dryer&tag=scratchanddentfinder-20' },
              { type: 'Dishwashers', savings: '20–35%', emoji: '🍽️', url: 'https://www.amazon.com/s?k=scratch+and+dent+dishwasher&tag=scratchanddentfinder-20' },
              { type: 'Ranges & Stoves', savings: '20–35%', emoji: '🔥', url: 'https://www.amazon.com/s?k=scratch+and+dent+range+stove&tag=scratchanddentfinder-20' },
              { type: 'Freezers', savings: '25–45%', emoji: '🧊', url: 'https://www.amazon.com/s?k=scratch+and+dent+freezer&tag=scratchanddentfinder-20' },
            ].map((deal) => (
              <a
                key={deal.type}
                href={deal.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 hover:border-sage-400 hover:bg-white transition-all"
              >
                <span className="text-3xl">{deal.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-sage-700 transition-colors">{deal.type}</p>
                  <p className="text-sm text-green-700 font-medium">Save {deal.savings}</p>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-sage-600">Amazon &rarr;</span>
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            As an Amazon Associate, Scratch &amp; Dent Finder earns from qualifying purchases.
          </p>
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Section 8: FAQ */}
      <HomeFAQ />

      {/* Section 9: AI Summary (AEO optimized) */}
      <AISummary />

      {/* Homepage Bottom Ad */}
      <div className="mx-auto max-w-4xl px-4 py-4">
        <AdUnit slot="3619341761" format="auto" />
      </div>

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
