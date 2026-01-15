/**
 * Terms of Service Page
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Scratch & Dent Finder',
  description: 'Terms of Service for Scratch & Dent Finder - Rules and guidelines for using our service.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-sm sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: January 2026</p>

          <div className="prose prose-gray mt-8 max-w-none">
            <h2>1. Introduction</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Scratch &amp; Dent Finder website, applications, and related services (collectively, the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms.
            </p>
            <p>
              Scratch &amp; Dent Finder is operated by <strong>MK153 Inc</strong>, a corporation organized under the laws of the United States (&quot;MK153&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). Scratch &amp; Dent Finder is a brand operated by MK153 Inc.
            </p>
            <p>
              If you do not agree to these Terms, you may not access or use the Service.
            </p>

            <hr className="my-8" />

            <h2>2. Description of the Service</h2>
            <p>
              Scratch &amp; Dent Finder is an online directory that helps users discover scratch and dent appliance retailers and related businesses. The Service may include business listings, location-based search, featured placements, claim functionality, and related tools.
            </p>
            <p>
              We do not guarantee the accuracy, completeness, or availability of any listing or business information.
            </p>

            <hr className="my-8" />

            <h2>3. Eligibility</h2>
            <p>
              You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you meet this requirement.
            </p>

            <hr className="my-8" />

            <h2>4. Business Listings and Claims</h2>

            <h3>4.1 Listings</h3>
            <p>
              Business listings may be created through automated data sources, third-party data, or user submissions. MK153 Inc does not guarantee that listings are accurate, current, or complete.
            </p>

            <h3>4.2 Claiming a Listing</h3>
            <p>
              Business owners or authorized representatives may submit a request to claim a listing. Claim approval is subject to manual review and approval by MK153 Inc. Submission of a claim does not guarantee approval.
            </p>
            <p>
              MK153 Inc reserves the right to reject, revoke, or remove claims at its sole discretion.
            </p>

            <hr className="my-8" />

            <h2>5. Featured Listings and Paid Services</h2>

            <h3>5.1 Paid Upgrades</h3>
            <p>
              Claiming a listing is free. Certain optional services, including featured placement or promotional visibility, may require payment.
            </p>

            <h3>5.2 Payments</h3>
            <p>
              All payments, subscriptions, and charges made through the Service are processed by <strong>MK153 Inc</strong>. Prices, billing terms, and renewal periods will be disclosed at the time of purchase.
            </p>

            <h3>5.3 No Guarantee of Results</h3>
            <p>
              Featured placement or paid services do not guarantee increased traffic, leads, or sales.
            </p>

            <hr className="my-8" />

            <h2>6. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Submit false or misleading information</li>
              <li>Impersonate another person or business</li>
              <li>Use the Service for unlawful purposes</li>
              <li>Interfere with the operation or security of the Service</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate access for violations of these Terms.
            </p>

            <hr className="my-8" />

            <h2>7. Intellectual Property</h2>
            <p>
              All content, trademarks, logos, software, and technology used in the Service are owned by or licensed to MK153 Inc. You may not copy, modify, distribute, or exploit any portion of the Service without prior written consent.
            </p>

            <hr className="my-8" />

            <h2>8. Disclaimers</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. MK153 Inc disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>

            <hr className="my-8" />

            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, MK153 Inc shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of or related to your use of the Service.
            </p>

            <hr className="my-8" />

            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless MK153 Inc from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>

            <hr className="my-8" />

            <h2>11. Modifications to the Service or Terms</h2>
            <p>
              We may modify the Service or these Terms at any time. Updated Terms will be posted on the Service with a revised effective date. Continued use of the Service constitutes acceptance of the updated Terms.
            </p>

            <hr className="my-8" />

            <h2>12. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law principles.
            </p>

            <hr className="my-8" />

            <h2>13. Contact Information</h2>
            <p>
              If you have questions about these Terms, please contact:
            </p>
            <p>
              <strong>MK153 Inc</strong><br />
              Email: <a href="mailto:support@mk153.com">support@mk153.com</a>
            </p>

            <hr className="my-8" />

            <h2>14. Cancellation and Refund Policy</h2>

            <h3>14.1 Subscription Cancellation</h3>
            <p>
              If you purchase a subscription or paid promotional service through the Service, you may cancel your subscription at any time through your account dashboard or by contacting MK153 Inc. Cancellation will take effect at the end of the current billing period.
            </p>
            <p>
              You will continue to receive the benefits of the paid service, including featured placement or promotional visibility, until the end of the billing period.
            </p>

            <h3>14.2 Refunds</h3>
            <p>
              All fees paid for subscriptions or promotional services are non-refundable, except where required by law.
            </p>
            <p>
              We do not offer prorated refunds for partial billing periods, unused time, or early cancellation.
            </p>

            <h3>14.3 Billing Errors</h3>
            <p>
              If you believe you were charged in error, please contact MK153 Inc within 7 days of the charge. We will review and, if appropriate, issue a correction or refund at our discretion.
            </p>

            <h3>14.4 Service Modifications</h3>
            <p>
              MK153 Inc reserves the right to modify, suspend, or discontinue any paid service at any time. If a paid service is discontinued, we may, at our discretion, provide a prorated refund or service credit.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
