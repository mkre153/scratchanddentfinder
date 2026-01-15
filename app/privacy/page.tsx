/**
 * Privacy Policy Page
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Scratch & Dent Finder',
  description: 'Privacy Policy for Scratch & Dent Finder - How we collect, use, and protect your information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-sm sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: January 2026</p>

          <div className="prose prose-gray mt-8 max-w-none">
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy explains how <strong>MK153 Inc</strong> (&quot;MK153&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and protects personal information collected through the Scratch &amp; Dent Finder website and services (the &quot;Service&quot;). Scratch &amp; Dent Finder is a brand operated by MK153 Inc.
            </p>
            <p>
              By using the Service, you consent to the practices described in this Privacy Policy.
            </p>

            <hr className="my-8" />

            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide</h3>
            <p>We may collect personal information that you voluntarily provide, including:</p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Business name and details</li>
              <li>Billing information (processed by third-party payment providers)</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>We may automatically collect information such as:</p>
            <ul>
              <li>IP address</li>
              <li>Browser type and device information</li>
              <li>Pages visited and usage data</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <hr className="my-8" />

            <h2>3. How We Use Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Operate and maintain the Service</li>
              <li>Process claims and submissions</li>
              <li>Communicate with users and business owners</li>
              <li>Process payments and subscriptions</li>
              <li>Improve and secure the Service</li>
              <li>Comply with legal obligations</li>
            </ul>

            <hr className="my-8" />

            <h2>4. Email, SMS, and Communications</h2>
            <p>
              By submitting your contact information, you consent to receive transactional emails and messages related to your use of the Service. Marketing communications may be sent in accordance with applicable laws and may be opted out of at any time.
            </p>

            <hr className="my-8" />

            <h2>5. Data Sharing and Third Parties</h2>
            <p>We may share information with trusted third-party service providers, including:</p>
            <ul>
              <li>Payment processors</li>
              <li>Email and messaging providers</li>
              <li>CRM and automation platforms</li>
            </ul>
            <p>These providers process data on our behalf and are required to safeguard it.</p>

            <hr className="my-8" />

            <h2>6. Data Controller</h2>
            <p>
              <strong>MK153 Inc</strong> is the data controller responsible for personal information collected through the Service.
            </p>

            <hr className="my-8" />

            <h2>7. Data Retention</h2>
            <p>
              We retain personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
            </p>

            <hr className="my-8" />

            <h2>8. Data Security</h2>
            <p>
              We implement reasonable administrative, technical, and physical safeguards to protect personal information. However, no method of transmission or storage is 100% secure.
            </p>

            <hr className="my-8" />

            <h2>9. Your Rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct, or delete your personal information. Requests may be submitted using the contact information below.
            </p>

            <hr className="my-8" />

            <h2>10. Cookies</h2>
            <p>
              The Service may use cookies and similar technologies to improve functionality and user experience. You may disable cookies through your browser settings.
            </p>

            <hr className="my-8" />

            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Updates will be posted with a revised effective date. Continued use of the Service constitutes acceptance of the updated policy.
            </p>

            <hr className="my-8" />

            <h2>12. Contact Information</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact:
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
