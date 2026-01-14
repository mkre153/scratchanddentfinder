/**
 * Homepage
 *
 * Minimal hero + stats + CTA for Slice 1.
 * NO DATA ASSUMPTIONS: Renders safely with empty database.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllStatesUrl } from '@/lib/urls'
import { generateHomepageMetadata } from '@/lib/seo'
import { getAllStates } from '@/lib/queries'

export const metadata: Metadata = generateHomepageMetadata()

// ISR: Revalidate every 5 minutes (directory data changes infrequently)
export const revalidate = 300

export default async function HomePage() {
  // Fetch states - handles empty database gracefully
  const states = await getAllStates()

  // Calculate stats from actual data
  const totalStores = states.reduce((sum, s) => sum + s.storeCount, 0)
  const totalStates = states.length
  const totalCities = states.reduce((sum, s) => sum + s.cityCount, 0)

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Save 30-70% on Quality Appliances
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
            Your trusted source for finding discount appliances with minor
            cosmetic damage. Find scratch and dent appliance stores near you.
          </p>

          {/* Stats Bar */}
          <div className="mt-10 flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">
                {totalStores.toLocaleString()}
              </div>
              <div className="text-sm text-blue-200">Stores</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{totalStates}</div>
              <div className="text-sm text-blue-200">States</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {totalCities.toLocaleString()}
              </div>
              <div className="text-sm text-blue-200">Cities</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={getAllStatesUrl()}
              className="rounded-md bg-yellow-400 px-8 py-3 text-lg font-semibold text-gray-900 hover:bg-yellow-500"
            >
              Browse All States
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Why Shop Scratch & Dent?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl">💰</div>
              <h3 className="mt-4 text-xl font-semibold">Save 30-70%</h3>
              <p className="mt-2 text-gray-600">
                Get the same quality appliances at a fraction of the retail
                price.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl">✅</div>
              <h3 className="mt-4 text-xl font-semibold">Full Warranties</h3>
              <p className="mt-2 text-gray-600">
                Many scratch and dent appliances come with full manufacturer
                warranties.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl">🚚</div>
              <h3 className="mt-4 text-xl font-semibold">Delivery Available</h3>
              <p className="mt-2 text-gray-600">
                Most stores offer delivery and installation services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Empty State Message */}
      {totalStores === 0 && (
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
