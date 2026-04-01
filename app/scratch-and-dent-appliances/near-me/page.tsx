/**
 * Near Me Landing Page
 *
 * SEO target: "scratch and dent appliances near me"
 * Server component with client-side geolocation enhancement via NearbyStores.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { AdUnit } from '@/components/ads/AdUnit'
import { JsonLd } from '@/lib/schema'
import { SITE_URL } from '@/lib/config'
import { getNearMeUrl, getAllStatesUrl, getStateUrl, getCityUrl } from '@/lib/urls'

// Lazy load geolocation component — client only
const NearbyStores = dynamic(
  () => import('@/components/directory/NearbyStores').then((m) => m.NearbyStores),
  { ssr: false, loading: () => null }
)

export const metadata: Metadata = {
  title: 'Scratch and Dent Appliances Near Me | Find Local Stores',
  description:
    'Find scratch and dent appliance stores near you. Save 20–60% on refrigerators, washers, dryers, and more at local outlets. Browse by city or use your location.',
  alternates: {
    canonical: `${SITE_URL}${getNearMeUrl()}`,
  },
  openGraph: {
    title: 'Scratch and Dent Appliances Near Me',
    description: 'Find local scratch and dent appliance outlets and save 20–60% off retail.',
    url: `${SITE_URL}${getNearMeUrl()}`,
  },
}

const FAQ_ITEMS = [
  {
    q: 'How do I find scratch and dent appliance stores near me?',
    a: 'Use the locator above to share your location or enter your ZIP code. We\'ll show the nearest scratch and dent outlets sorted by distance. You can also browse by state or city using our directory.',
  },
  {
    q: 'What is a scratch and dent appliance?',
    a: 'Scratch and dent appliances are brand-new or open-box units with minor cosmetic damage — a small dent, a scratch, or light packaging wear. They function identically to full-price appliances and often carry the same manufacturer warranty.',
  },
  {
    q: 'How much can I save on scratch and dent appliances?',
    a: 'Savings range from 20% to 60% off retail prices depending on the appliance type, brand, and severity of cosmetic damage. Refrigerators and laundry units typically see the steepest discounts.',
  },
  {
    q: 'Are scratch and dent appliances safe to buy?',
    a: 'Yes. Cosmetic damage does not affect appliance performance or safety. Always ask the retailer whether the original manufacturer warranty is still valid and request a functional test before purchase.',
  },
  {
    q: 'What appliances have the best scratch and dent deals?',
    a: 'Refrigerators, washing machines, and dryers typically have the best availability and savings. Dishwashers are also excellent because cosmetic damage is hidden after installation.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

// Top metro areas — static for SEO, updated manually
const TOP_METROS = [
  { label: 'Los Angeles, CA', stateSlug: 'california', citySlug: 'los-angeles' },
  { label: 'Houston, TX', stateSlug: 'texas', citySlug: 'houston' },
  { label: 'Chicago, IL', stateSlug: 'illinois', citySlug: 'chicago' },
  { label: 'Phoenix, AZ', stateSlug: 'arizona', citySlug: 'phoenix' },
  { label: 'Philadelphia, PA', stateSlug: 'pennsylvania', citySlug: 'philadelphia' },
  { label: 'San Antonio, TX', stateSlug: 'texas', citySlug: 'san-antonio' },
  { label: 'San Diego, CA', stateSlug: 'california', citySlug: 'san-diego' },
  { label: 'Dallas, TX', stateSlug: 'texas', citySlug: 'dallas' },
  { label: 'Jacksonville, FL', stateSlug: 'florida', citySlug: 'jacksonville' },
  { label: 'Austin, TX', stateSlug: 'texas', citySlug: 'austin' },
  { label: 'Columbus, OH', stateSlug: 'ohio', citySlug: 'columbus' },
  { label: 'Charlotte, NC', stateSlug: 'north-carolina', citySlug: 'charlotte' },
]

export default function NearMePage() {
  return (
    <>
      <JsonLd data={faqSchema} />

      {/* Hero */}
      <section className="bg-warm-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-charcoal sm:text-5xl">
            Find Scratch and Dent Appliance Stores Near You
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
            Save 20–60% on refrigerators, washers, dryers, and more at local
            scratch and dent outlets. Share your location or enter your ZIP to
            find stores within 50 miles.
          </p>
        </div>
      </section>

      {/* Geolocation finder */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <NearbyStores variant="homepage" />
        </div>
      </section>

      {/* Top Metro Areas */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Browse Top Metro Areas
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {TOP_METROS.map((metro) => (
              <Link
                key={metro.citySlug}
                href={getCityUrl(
                  { slug: metro.stateSlug },
                  { slug: metro.citySlug }
                )}
                className="block rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-sage-400 hover:text-sage-700 transition-colors"
              >
                {metro.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href={getAllStatesUrl()}
              className="text-sm font-medium text-sage-700 hover:text-sage-800"
            >
              Browse all states &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Why Scratch & Dent */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Why Buy Scratch and Dent Near You?
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-sage-50 p-6">
              <div className="text-2xl font-bold text-sage-700 mb-2">20–60%</div>
              <p className="text-gray-700 font-medium mb-1">Off Retail</p>
              <p className="text-sm text-gray-600">
                Local stores price to move inventory fast. Prices are often better
                than online listings.
              </p>
            </div>
            <div className="rounded-lg bg-sage-50 p-6">
              <div className="text-2xl font-bold text-sage-700 mb-2">See It First</div>
              <p className="text-gray-700 font-medium mb-1">In Person</p>
              <p className="text-sm text-gray-600">
                Inspect the actual damage before buying — no surprises when the
                appliance arrives.
              </p>
            </div>
            <div className="rounded-lg bg-sage-50 p-6">
              <div className="text-2xl font-bold text-sage-700 mb-2">Same Day</div>
              <p className="text-gray-700 font-medium mb-1">Pickup Available</p>
              <p className="text-sm text-gray-600">
                Many local outlets offer same-day or next-day pickup — no weeks of
                waiting for shipping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ad: nearme-bottom */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AdUnit slot="nearme-bottom" format="horizontal" />
      </div>

      {/* FAQ */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-gray-600 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
