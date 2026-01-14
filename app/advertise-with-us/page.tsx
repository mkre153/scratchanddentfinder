/**
 * Advertise With Us Page
 *
 * Slice 7: MARKETING SURFACE (Read-Only)
 * - Server component only
 * - Stats via getAllStates() pattern
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { generateAdvertiseMetadata } from '@/lib/seo'
import { getAllStates } from '@/lib/queries'
import { getStoreSubmitUrl, getContactUrl } from '@/lib/urls'

export const metadata: Metadata = generateAdvertiseMetadata()

export default async function AdvertisePage() {
  // Fetch states for dynamic stats (established pattern from homepage)
  const states = await getAllStates()

  const totalStores = states.reduce((sum, s) => sum + s.storeCount, 0)
  const totalCities = states.reduce((sum, s) => sum + s.cityCount, 0)

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Advertise With Us
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
            Get your appliance store in front of motivated buyers
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-blue-700">
                {totalStores.toLocaleString()}+
              </div>
              <div className="text-gray-600">Store Listings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-700">
                {totalCities.toLocaleString()}+
              </div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-700">50</div>
              <div className="text-gray-600">States</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Featured Listing Plans
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            Stand out from the competition with a featured listing
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">
                Featured Monthly
              </h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Billed monthly
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Top placement in city listings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Featured badge on your listing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>5x more visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Cancel anytime</span>
                </li>
              </ul>
              <Link
                href={getStoreSubmitUrl()}
                className="mt-8 block w-full rounded-md bg-blue-700 py-3 text-center font-semibold text-white hover:bg-blue-800"
              >
                Get Started
              </Link>
            </div>

            {/* Annual Plan */}
            <div className="relative rounded-lg border-2 border-blue-700 bg-white p-8 shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-700 px-4 py-1 text-sm font-semibold text-white">
                Best Value
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Featured Annual
              </h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$290</span>
                <span className="text-gray-600">/year</span>
              </div>
              <p className="mt-2 text-sm text-green-600 font-semibold">
                Save $58 (2 months free)
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Everything in Monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Upload store photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Lock in your rate</span>
                </li>
              </ul>
              <Link
                href={getStoreSubmitUrl()}
                className="mt-8 block w-full rounded-md bg-yellow-400 py-3 text-center font-semibold text-gray-900 hover:bg-yellow-500"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Why Advertise With Us?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="text-lg font-semibold">Targeted Traffic</h3>
                <p className="mt-1 text-gray-600">
                  Reach customers actively searching for scratch and dent
                  appliances in your area.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">📱</div>
              <div>
                <h3 className="text-lg font-semibold">Mobile Optimized</h3>
                <p className="mt-1 text-gray-600">
                  80% of local searches happen on mobile. Your listing looks
                  great on any device.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">🔍</div>
              <div>
                <h3 className="text-lg font-semibold">SEO Benefits</h3>
                <p className="mt-1 text-gray-600">
                  Improve your local search rankings with a quality backlink and
                  listing.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">⚡</div>
              <div>
                <h3 className="text-lg font-semibold">Quick Results</h3>
                <p className="mt-1 text-gray-600">
                  Most stores see increased traffic within 24-48 hours of going
                  featured.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                1
              </div>
              <h3 className="mt-4 text-lg font-semibold">Submit Your Store</h3>
              <p className="mt-2 text-gray-600">
                Fill out our simple form with your store details.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                2
              </div>
              <h3 className="mt-4 text-lg font-semibold">Get Approved</h3>
              <p className="mt-2 text-gray-600">
                We review submissions within 24-48 hours.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                3
              </div>
              <h3 className="mt-4 text-lg font-semibold">Upgrade to Featured</h3>
              <p className="mt-2 text-gray-600">
                Choose a plan and start getting more visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Ready to Grow Your Business?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-blue-100">
            Join hundreds of appliance stores already benefiting from featured
            placement.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={getStoreSubmitUrl()}
              className="rounded-md bg-yellow-400 px-8 py-3 text-lg font-semibold text-gray-900 hover:bg-yellow-500"
            >
              Get Started Free
            </Link>
            <Link
              href={getContactUrl()}
              className="rounded-md border border-white bg-transparent px-8 py-3 text-lg font-semibold text-white hover:bg-white/10"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
