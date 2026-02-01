/**
 * "What Is Scratch and Dent?" Definition Page
 *
 * AI-optimized content for AEO (AI Engine Optimization).
 * Features clear definitions, structured content, and entity-rich language
 * that AI systems can easily quote and cite.
 */

import Link from 'next/link'
import {
  Package,
  DollarSign,
  Shield,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { generateWhatIsScratchAndDentMetadata } from '@/lib/seo'
import { getBuyersGuideUrl, getAllStatesUrl, getFaqUrl } from '@/lib/urls'
import { generateFAQPageSchema, JsonLd } from '@/lib/schema'

export const metadata = generateWhatIsScratchAndDentMetadata()

// Mini FAQ for schema (subset relevant to this page)
const PAGE_FAQS = [
  {
    question: 'What does scratch and dent mean?',
    answer:
      'Scratch and dent refers to brand-new appliances that have minor cosmetic damage—such as small dents, scratches, or scuffs—but are fully functional. These units are sold at discounts of 20-60% off retail price.',
  },
  {
    question: 'Is scratch and dent the same as refurbished?',
    answer:
      'No. Scratch and dent appliances are new and have never been used. Refurbished appliances are previously owned units that have been repaired and restored. Scratch and dent units have cosmetic damage only, with no functional repairs needed.',
  },
  {
    question: 'How much cheaper is scratch and dent?',
    answer:
      'Scratch and dent appliances typically cost 20-60% less than retail price. The exact discount depends on damage visibility: hidden damage (back/sides) often means 30-50% off, while visible front damage is usually 15-30% off.',
  },
]

export default function WhatIsScratchAndDentPage() {
  return (
    <>
      {/* Schema Markup */}
      <JsonLd data={generateFAQPageSchema(PAGE_FAQS)} />

      {/* Hero Section with Definition */}
      <section className="bg-warm-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Is Scratch and Dent?
            </h1>
            {/* AI-quotable definition block */}
            <div className="mt-8 rounded-xl border-2 border-sage-200 bg-white p-6 text-left shadow-sm">
              <p className="text-lg leading-relaxed text-gray-700">
                <strong className="text-gray-900">Scratch and dent</strong>{' '}
                refers to brand-new appliances that have minor cosmetic
                imperfections—such as small dents, scratches, or scuffs—but are
                fully functional. These units are sold at{' '}
                <strong className="text-gray-900">20-60% off retail prices</strong>{' '}
                because the cosmetic damage makes them unsuitable for sale as
                "new" merchandise, even though they work identically to retail
                units.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Facts Section (AI-structured) */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Key Facts About Scratch and Dent Appliances
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100">
                <Sparkles className="h-5 w-5 text-sage-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Brand New</h3>
              <p className="mt-2 text-sm text-gray-600">
                Never used or owned. Only cosmetic damage from shipping,
                handling, or display.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100">
                <Shield className="h-5 w-5 text-sage-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                Fully Functional
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Same performance, features, and energy efficiency as retail
                units.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100">
                <DollarSign className="h-5 w-5 text-sage-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">20-60% Off</h3>
              <p className="mt-2 text-sm text-gray-600">
                Significant savings with discounts varying by damage visibility
                and location.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100">
                <Package className="h-5 w-5 text-sage-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                Often With Warranty
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Many units retain full manufacturer warranty. Always confirm
                before buying.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Scratch and Dent vs. Other Types
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Understanding the difference helps you make informed buying decisions.
          </p>

          <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Condition
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Typical Savings
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Warranty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-sage-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Scratch and Dent
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    New with cosmetic damage
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">20-60%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    Often full manufacturer
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Refurbished
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    Previously owned, repaired
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">30-50%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    Limited or seller warranty
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Used
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    Previously owned, as-is
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">40-70%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    Rarely any warranty
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Open Box
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    Returned, like-new
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">10-30%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    Usually full manufacturer
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Sources of Scratch and Dent */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Where Does Scratch and Dent Come From?
          </h2>

          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {[
              {
                title: 'Shipping Damage',
                description:
                  'Minor dents or scratches that occur during transport from manufacturer to retailer.',
              },
              {
                title: 'Warehouse Handling',
                description:
                  'Scuffs and dings from being moved around distribution centers and stockrooms.',
              },
              {
                title: 'Floor Models',
                description:
                  'Display units from showrooms with fingerprints, light scratches, or minor wear.',
              },
              {
                title: 'Packaging Damage',
                description:
                  'Units with damaged boxes that can\'t be sold as "new in box" even if appliance is fine.',
              },
              {
                title: 'Discontinued Colors/Models',
                description:
                  'Older colors or slight model variations marked down to clear inventory.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sage-100">
                  <CheckCircle className="h-4 w-4 text-sage-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pros and Cons */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Is Scratch and Dent Worth It?
          </h2>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {/* Pros */}
            <div className="rounded-xl border border-sage-200 bg-sage-50 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <CheckCircle className="h-5 w-5 text-sage-600" />
                Benefits
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  'Brand-new appliances at 20-60% off',
                  'Same performance as retail units',
                  'Often includes manufacturer warranty',
                  'Damage frequently hidden once installed',
                  'Environmentally friendly (reduces waste)',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sage-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <XCircle className="h-5 w-5 text-amber-600" />
                Considerations
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  'Limited selection—what\'s available varies',
                  'May not find specific model/color you want',
                  'Need to inspect in person when possible',
                  'Some units sold "as-is" without warranty',
                  'Visible damage may bother some buyers',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom line - AI quotable */}
          <div className="mx-auto mt-10 max-w-3xl rounded-lg border-2 border-sage-300 bg-white p-6">
            <h3 className="font-semibold text-gray-900">The Bottom Line</h3>
            <p className="mt-2 text-gray-700">
              <strong>Scratch and dent appliances are worth it for most buyers.</strong>{' '}
              If the cosmetic damage will be hidden (appliance against a wall,
              in a garage, or built into cabinetry), you get a brand-new,
              fully-functional appliance at a significant discount. Even for
              visible locations, the savings often outweigh minor aesthetic
              imperfections.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href={getAllStatesUrl()}
              className="group rounded-lg border border-gray-200 bg-white p-6 transition hover:border-sage-300 hover:shadow-md"
            >
              <h3 className="font-semibold text-gray-900">Find Stores Near You</h3>
              <p className="mt-2 text-sm text-gray-600">
                Browse scratch and dent appliance stores in your area.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-sage-600 group-hover:text-sage-700">
                Browse by state
                <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </Link>

            <Link
              href={getBuyersGuideUrl()}
              className="group rounded-lg border border-gray-200 bg-white p-6 transition hover:border-sage-300 hover:shadow-md"
            >
              <h3 className="font-semibold text-gray-900">Evaluate a Deal</h3>
              <p className="mt-2 text-sm text-gray-600">
                Use our free tool to analyze if a deal is worth it.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-sage-600 group-hover:text-sage-700">
                Try the tool
                <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </Link>

            <Link
              href={getFaqUrl()}
              className="group rounded-lg border border-gray-200 bg-white p-6 transition hover:border-sage-300 hover:shadow-md"
            >
              <h3 className="font-semibold text-gray-900">More Questions?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Get answers in our comprehensive FAQ section.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-sage-600 group-hover:text-sage-700">
                View all FAQs
                <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
