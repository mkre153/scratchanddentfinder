import type { Metadata } from 'next'
import Link from 'next/link'
import { generateContactMetadata } from '@/lib/seo'
import { getAboutUrl, getStoreSubmitUrl } from '@/lib/urls'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = generateContactMetadata()

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-warm-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-charcoal sm:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            We&apos;d love to hear from you
          </p>
        </div>
      </section>

      {/* Contact Form + Sidebar */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Form */}
            <div className="md:col-span-2 rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Send us a message
              </h2>
              <ContactForm />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Submit Your Store */}
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

              {/* Email */}
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900">
                  Email Us Directly
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Prefer email? Reach us at:
                </p>
                <a
                  href="mailto:support@scratchanddentfinder.com"
                  className="mt-1 block text-sm text-sage-600 hover:underline"
                >
                  support@scratchanddentfinder.com
                </a>
              </div>

              {/* Response Time */}
              <div className="rounded-lg bg-gray-50 p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Response Time
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-16">
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
                I found incorrect information about a store.
              </h3>
              <p className="mt-2 text-gray-600">
                Use the contact form above and select &quot;Store
                Correction&quot; as the subject. Include the store name and the
                correction needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Link */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">Learn More</h2>
          <p className="mt-4 text-gray-600">
            Want to know more about Scratch & Dent Finder?
          </p>
          <Link
            href={getAboutUrl()}
            className="mt-6 inline-block rounded-md border border-sage-500 bg-white px-6 py-3 font-semibold text-sage-700 hover:bg-sage-50"
          >
            About Us
          </Link>
        </div>
      </section>
    </>
  )
}
