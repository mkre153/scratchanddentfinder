/**
 * About Page
 *
 * Slice 7: MARKETING SURFACE (Read-Only)
 * - Server component only
 * - Stats via getAllStates() pattern
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { generateAboutMetadata } from '@/lib/seo'
import { getAllStates } from '@/lib/queries'
import { getAllStatesUrl, getContactUrl, getStoreSubmitUrl } from '@/lib/urls'

export const metadata: Metadata = generateAboutMetadata()

export default async function AboutPage() {
  // Fetch states for dynamic stats (established pattern from homepage)
  const states = await getAllStates()

  const totalStores = states.reduce((sum, s) => sum + s.storeCount, 0)
  const totalStates = states.filter((s) => s.storeCount > 0).length
  const totalCities = states.reduce((sum, s) => sum + s.cityCount, 0)

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            About Scratch & Dent Locator
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
            Helping families find affordable appliances since 2024
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          <p className="mt-4 text-lg text-gray-600">
            We believe everyone deserves access to quality home appliances without
            breaking the bank. Scratch and dent appliances offer the same
            performance and reliability as their retail counterparts, just with
            minor cosmetic imperfections that most people never notice.
          </p>
          <p className="mt-4 text-lg text-gray-600">
            Our directory connects you with trusted scratch and dent appliance
            stores across the country, making it easy to find great deals in your
            area.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Our Directory
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <div className="text-4xl font-bold text-blue-700">
                {totalStores.toLocaleString()}
              </div>
              <div className="mt-2 text-gray-600">Store Listings</div>
            </div>
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <div className="text-4xl font-bold text-blue-700">{totalStates}</div>
              <div className="mt-2 text-gray-600">States Covered</div>
            </div>
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <div className="text-4xl font-bold text-blue-700">
                {totalCities.toLocaleString()}
              </div>
              <div className="mt-2 text-gray-600">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Scratch & Dent */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Why Shop Scratch & Dent?
          </h2>
          <div className="mt-8 space-y-6">
            <div className="flex gap-4">
              <div className="text-2xl">💰</div>
              <div>
                <h3 className="text-xl font-semibold">Save 30-70%</h3>
                <p className="mt-1 text-gray-600">
                  Scratch and dent appliances typically cost 30-70% less than
                  retail, with the same functionality and performance.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="text-xl font-semibold">Full Warranties</h3>
                <p className="mt-1 text-gray-600">
                  Many scratch and dent appliances come with full manufacturer
                  warranties, just like new products.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">🌍</div>
              <div>
                <h3 className="text-xl font-semibold">Reduce Waste</h3>
                <p className="mt-1 text-gray-600">
                  Buying scratch and dent helps reduce waste by giving perfectly
                  functional appliances a second chance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
          <p className="mt-4 text-lg text-gray-600">
            Have questions or feedback? We&apos;d love to hear from you.
          </p>
          <div className="mt-6 space-y-2">
            <p className="text-gray-600">
              <span className="font-semibold">General Inquiries:</span>{' '}
              <a
                href="mailto:scratchanddentlocator@gmail.com"
                className="text-blue-700 hover:underline"
              >
                scratchanddentlocator@gmail.com
              </a>
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Business:</span>{' '}
              <a
                href="mailto:business@scratchanddentlocator.com"
                className="text-blue-700 hover:underline"
              >
                business@scratchanddentlocator.com
              </a>
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={getContactUrl()}
              className="rounded-md bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Contact Us
            </Link>
            <Link
              href={getAllStatesUrl()}
              className="rounded-md border border-blue-700 bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </section>

      {/* Store Owners CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Own an Appliance Store?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Join our directory and connect with customers looking for scratch and
            dent appliances in your area.
          </p>
          <Link
            href={getStoreSubmitUrl()}
            className="mt-8 inline-block rounded-md bg-yellow-400 px-8 py-3 text-lg font-semibold text-gray-900 hover:bg-yellow-500"
          >
            Add Your Store
          </Link>
        </div>
      </section>
    </>
  )
}
