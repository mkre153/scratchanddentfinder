/**
 * Cancellation & Refund Policy Page
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | Scratch & Dent Finder',
  description: 'Cancellation and Refund Policy for Scratch & Dent Finder - Information about subscription cancellations and refunds.',
}

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-sm sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900">Cancellation & Refund Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: January 2026</p>

          <div className="prose prose-gray mt-8 max-w-none">
            <p>
              This Cancellation & Refund Policy applies to paid services offered through Scratch & Dent Finder, a brand operated by <strong>MK153 Inc</strong>, incorporated in the <strong>State of California</strong>.
            </p>

            <hr className="my-8" />

            <h2>1. Subscription Cancellation</h2>
            <p>
              If you purchase a subscription or paid promotional service through the Service, you may cancel your subscription at any time through your account dashboard or by contacting MK153 Inc.
            </p>
            <p>
              Cancellation will take effect at the end of the current billing period. You will continue to receive the benefits of the paid service, including featured placement or promotional visibility, until the end of that billing period.
            </p>

            <hr className="my-8" />

            <h2>2. Refunds</h2>
            <p>
              All fees paid for subscriptions or promotional services are <strong>non-refundable</strong>, except where required by law.
            </p>
            <p>
              We do not offer prorated refunds for partial billing periods, unused time, or early cancellation.
            </p>

            <hr className="my-8" />

            <h2>3. Billing Errors</h2>
            <p>
              If you believe you were charged in error, please contact MK153 Inc within <strong>7 days</strong> of the charge. We will review the issue and, if appropriate, issue a correction or refund at our discretion.
            </p>

            <hr className="my-8" />

            <h2>4. Service Modifications</h2>
            <p>
              MK153 Inc reserves the right to modify, suspend, or discontinue any paid service at any time. If a paid service is discontinued, MK153 Inc may, at its discretion, provide a prorated refund or service credit.
            </p>

            <hr className="my-8" />

            <h2>5. Contact Information</h2>
            <p>
              If you have questions about cancellations or refunds, please contact:
            </p>
            <p>
              <strong>MK153 Inc</strong><br />
              Email: <a href="mailto:support@mk153.com">support@mk153.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
