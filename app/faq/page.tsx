/**
 * FAQ Page
 *
 * Comprehensive FAQ about scratch and dent appliances.
 * Features FAQPage schema markup for rich search results.
 */

import Link from 'next/link'
import { HelpCircle, ArrowRight } from 'lucide-react'
import { generateFaqMetadata } from '@/lib/seo'
import { getBuyersGuideUrl, getWhatIsScratchAndDentUrl, getAllStatesUrl } from '@/lib/urls'
import { generateFAQPageSchema, JsonLd } from '@/lib/schema'

export const metadata = generateFaqMetadata()

// Comprehensive FAQ data organized by category
const FAQ_CATEGORIES = [
  {
    title: 'Understanding Scratch & Dent',
    faqs: [
      {
        question: 'What are scratch and dent appliances?',
        answer:
          'Scratch and dent appliances are brand-new, fully functional units that have minor cosmetic imperfections—such as small dents, scratches, or scuffs—typically from shipping, handling, or being floor display models. They perform identically to retail units but sell at significant discounts.',
      },
      {
        question: 'Are scratch and dent appliances used or refurbished?',
        answer:
          'No. Scratch and dent appliances are new, not used or refurbished. They have never been owned or operated by a consumer. The only difference from retail units is minor cosmetic damage that occurred during manufacturing, shipping, or in-store handling.',
      },
      {
        question: 'What causes appliances to become scratch and dent?',
        answer:
          'Common causes include: shipping damage during transport to retailers, minor dents from warehouse handling, scratches from being moved on the sales floor, packaging damage that affects appearance but not function, and discontinued colors or models being marked down.',
      },
    ],
  },
  {
    title: 'Safety & Quality',
    faqs: [
      {
        question: 'Are scratch and dent appliances safe to use?',
        answer:
          'Yes. Scratch and dent appliances are fully functional and meet all safety standards. The cosmetic damage does not affect performance, energy efficiency, or safety features. If an appliance had functional damage, it would be classified differently (as defective or for parts).',
      },
      {
        question: 'Do scratch and dent appliances last as long as regular ones?',
        answer:
          'Yes. Since scratch and dent appliances are functionally identical to retail units, they have the same expected lifespan. A small dent on the side panel has no impact on compressor life, motor durability, or overall longevity.',
      },
      {
        question: 'Are scratch and dent appliances energy efficient?',
        answer:
          'Absolutely. Scratch and dent appliances maintain their Energy Star ratings and efficiency specifications. Cosmetic damage does not affect energy consumption—you get the same efficiency at a lower price.',
      },
    ],
  },
  {
    title: 'Warranties & Returns',
    faqs: [
      {
        question: 'Do scratch and dent appliances come with a warranty?',
        answer:
          'It depends on the retailer. Many scratch and dent units retain full manufacturer warranty coverage. Some retailers offer their own warranty or sell units "as-is." Always confirm warranty status before purchasing—it should be in writing.',
      },
      {
        question: 'Can I return a scratch and dent appliance?',
        answer:
          'Return policies vary by retailer. Many offer 14-30 day return windows, while some mark items as final sale. Always ask about the return policy before buying, and get it in writing if possible.',
      },
      {
        question: 'What if the appliance has a functional problem I discover later?',
        answer:
          "If your appliance has manufacturer warranty coverage, functional defects are typically covered just like any retail purchase. For 'as-is' purchases, your protection depends on the retailer's policy—another reason to confirm warranty terms upfront.",
      },
    ],
  },
  {
    title: 'Savings & Value',
    faqs: [
      {
        question: 'How much can I save on scratch and dent appliances?',
        answer:
          'Typical savings range from 20-60% off retail prices. Hidden damage (on backs or sides) often means 30-50% off. Visible front damage typically brings 15-30% discounts. High-end brands and larger appliances often have the biggest dollar savings.',
      },
      {
        question: 'Are scratch and dent appliances worth it?',
        answer:
          'For most buyers, yes. If the damage will be hidden (appliance against a wall, inside a cabinet, or in a garage), you get a brand-new appliance at a significant discount. Even visible damage is often barely noticeable and worth the savings.',
      },
      {
        question: 'Where can I find scratch and dent appliances?',
        answer:
          'Sources include: dedicated scratch and dent stores, big-box retailer outlet sections, appliance liquidators, manufacturer outlet stores, and online marketplaces. Our directory helps you find local scratch and dent stores across the US.',
      },
    ],
  },
  {
    title: 'Buying Tips',
    faqs: [
      {
        question: 'What should I inspect before buying a scratch and dent appliance?',
        answer:
          'Check for: rust or water stains (signs of deeper damage), unusual odors, damaged power cords or plugs, missing parts or accessories, and verify the unit powers on. Also confirm model number matches the specifications you want.',
      },
      {
        question: 'Can I negotiate the price on scratch and dent appliances?',
        answer:
          'Often yes, especially at independent dealers and outlet stores. Big-box retailers have less flexibility. Ask about additional discounts for: units sitting for a while, multiple item purchases, floor models, or paying cash.',
      },
      {
        question: 'Should I buy scratch and dent appliances online or in-store?',
        answer:
          'In-store is generally better for scratch and dent purchases. You can personally inspect the damage, verify the unit works, and ensure the cosmetic issues are acceptable to you. Online photos may not show all damage.',
      },
    ],
  },
]

// Flatten FAQs for schema markup
const ALL_FAQS = FAQ_CATEGORIES.flatMap((category) => category.faqs)

export default function FaqPage() {
  return (
    <>
      {/* Schema Markup */}
      <JsonLd data={generateFAQPageSchema(ALL_FAQS)} />

      {/* Hero Section */}
      <section className="bg-warm-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
              <HelpCircle className="h-8 w-8 text-sage-600" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Everything you need to know about buying scratch and dent
              appliances—from safety and warranties to savings and tips.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {FAQ_CATEGORIES.map((category) => (
            <div key={category.title} className="mb-12 last:mb-0">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                {category.title}
              </h2>
              <div className="space-y-6">
                {category.faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-lg border border-gray-200 bg-white p-6"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <p className="mt-3 text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Definition Page CTA */}
            <Link
              href={getWhatIsScratchAndDentUrl()}
              className="group rounded-lg border border-gray-200 bg-white p-6 transition hover:border-sage-300 hover:shadow-md"
            >
              <h3 className="font-semibold text-gray-900">
                What Is Scratch & Dent?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Deep dive into scratch and dent appliances—definition, types,
                and how they differ from used or refurbished.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-sage-600 group-hover:text-sage-700">
                Learn more
                <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </Link>

            {/* Buyer's Tool CTA */}
            <Link
              href={getBuyersGuideUrl()}
              className="group rounded-lg border border-gray-200 bg-white p-6 transition hover:border-sage-300 hover:shadow-md"
            >
              <h3 className="font-semibold text-gray-900">
                Evaluate Your Deal
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Use our free tool to analyze a scratch and dent deal and get a
                buy, negotiate, or walk away recommendation.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-sage-600 group-hover:text-sage-700">
                Try the tool
                <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </Link>

            {/* Find Stores CTA */}
            <Link
              href={getAllStatesUrl()}
              className="group rounded-lg border border-gray-200 bg-white p-6 transition hover:border-sage-300 hover:shadow-md"
            >
              <h3 className="font-semibold text-gray-900">Find Stores</h3>
              <p className="mt-2 text-sm text-gray-600">
                Browse scratch and dent appliance stores near you. We list
                retailers across all 50 states.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-sage-600 group-hover:text-sage-700">
                Browse stores
                <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
