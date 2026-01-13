/**
 * Contact Page
 *
 * Slice 7: MARKETING SURFACE (Read-Only)
 * - Server component only
 * - mailto only (NO backend form endpoint)
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { generateContactMetadata } from '@/lib/seo'
import { getAboutUrl, getStoreSubmitUrl, getAdvertiseUrl } from '@/lib/urls'

export const metadata: Metadata = generateContactMetadata()

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
            We&apos;d love to hear from you
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* General Inquiries */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-bold text-gray-900">
                General Inquiries
              </h2>
              <p className="mt-2 text-gray-600">
                Questions about our directory, how it works, or general feedback.
              </p>
              <a
                href="mailto:scratchanddentlocator@gmail.com?subject=General%20Inquiry"
                className="mt-4 inline-block rounded-md bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Email Us
              </a>
              <p className="mt-3 text-sm text-gray-500">
                scratchanddentlocator@gmail.com
              </p>
            </div>

            {/* Business Inquiries */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-bold text-gray-900">
                Business Inquiries
              </h2>
              <p className="mt-2 text-gray-600">
                Partnership opportunities, advertising, or business proposals.
              </p>
              <a
                href="mailto:business@scratchanddentlocator.com?subject=Business%20Inquiry"
                className="mt-4 inline-block rounded-md bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Contact Business Team
              </a>
              <p className="mt-3 text-sm text-gray-500">
                business@scratchanddentlocator.com
              </p>
            </div>

            {/* Store Submission */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-bold text-gray-900">
                Add Your Store
              </h2>
              <p className="mt-2 text-gray-600">
                Own a scratch and dent appliance store? Get listed in our
                directory.
              </p>
              <Link
                href={getStoreSubmitUrl()}
                className="mt-4 inline-block rounded-md bg-yellow-400 px-6 py-3 font-semibold text-gray-900 hover:bg-yellow-500"
              >
                Submit Your Store
              </Link>
            </div>

            {/* Feedback */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-bold text-gray-900">Feedback</h2>
              <p className="mt-2 text-gray-600">
                Found an issue? Have a suggestion? We appreciate your feedback.
              </p>
              <a
                href="mailto:feedback@scratchanddentlocator.com?subject=Website%20Feedback"
                className="mt-4 inline-block rounded-md border border-blue-700 bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50"
              >
                Send Feedback
              </a>
              <p className="mt-3 text-sm text-gray-500">
                feedback@scratchanddentlocator.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Response Time */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">Response Time</h2>
          <p className="mt-4 text-gray-600">
            We typically respond to all inquiries within 24-48 hours during
            business days. For urgent matters, please include &quot;URGENT&quot;
            in your subject line.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                How do I add my store to the directory?
              </h3>
              <p className="mt-2 text-gray-600">
                Visit our{' '}
                <Link
                  href={getStoreSubmitUrl()}
                  className="text-blue-700 hover:underline"
                >
                  store submission page
                </Link>{' '}
                to add your appliance store. Submissions are reviewed within
                24-48 hours.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                How can I get featured placement?
              </h3>
              <p className="mt-2 text-gray-600">
                Check out our{' '}
                <Link
                  href={getAdvertiseUrl()}
                  className="text-blue-700 hover:underline"
                >
                  advertising options
                </Link>{' '}
                for featured listing plans that give your store top visibility.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                I found incorrect information about a store.
              </h3>
              <p className="mt-2 text-gray-600">
                Please email us at{' '}
                <a
                  href="mailto:scratchanddentlocator@gmail.com?subject=Store%20Information%20Correction"
                  className="text-blue-700 hover:underline"
                >
                  scratchanddentlocator@gmail.com
                </a>{' '}
                with the store name and the correction needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Link */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">Learn More</h2>
          <p className="mt-4 text-gray-600">
            Want to know more about Scratch & Dent Locator?
          </p>
          <Link
            href={getAboutUrl()}
            className="mt-6 inline-block rounded-md border border-blue-700 bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50"
          >
            About Us
          </Link>
        </div>
      </section>
    </>
  )
}
