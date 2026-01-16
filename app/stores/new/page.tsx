/**
 * Store Submission Page
 *
 * Slice 4: Untrusted inbound submissions, isolated from directory.
 * This form creates StoreSubmission records (pending review).
 * It does NOT create Store records.
 * It does NOT affect the public directory.
 */

import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/config'
import { StoreSubmissionForm } from './form'

export const metadata: Metadata = {
  title: `Submit Your Store | ${SITE_NAME}`,
  description:
    'Submit your scratch and dent appliance store to our directory. Free listing for all stores.',
}

export default function StoreSubmissionPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-warm-50 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            Submit Your Store
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Add your scratch and dent appliance store to our directory.
            Submissions are reviewed before appearing publicly.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border bg-white p-6 shadow-sm sm:p-8">
            <StoreSubmissionForm />
          </div>
        </div>
      </section>
    </>
  )
}
