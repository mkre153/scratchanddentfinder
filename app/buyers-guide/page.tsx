/**
 * Buyer's Guide Page
 *
 * Standalone page featuring the full Buyer's Tool wizard
 * with educational content about evaluating scratch & dent deals.
 */

import type { Metadata } from 'next'
import { BuyerToolWizard } from '@/components/buyers-tool'
import { Eye, Shield, DollarSign, Truck, CheckCircle, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: "Buyer's Guide: Should You Buy This Scratch & Dent Appliance?",
  description:
    'Free tool to evaluate scratch and dent appliance deals. Get personalized recommendations on whether to proceed, negotiate, or walk away based on damage, warranty, pricing, and more.',
  openGraph: {
    title: "Buyer's Guide | Scratch and Dent Finder",
    description:
      'Evaluate scratch and dent appliance deals with our free decision tool. Get personalized buy/skip recommendations.',
    type: 'website',
  },
}

// Educational content sections
const WHAT_WE_ANALYZE = [
  {
    icon: Eye,
    title: 'Damage Assessment',
    description:
      'Location, severity, and visibility of cosmetic damage based on your installation.',
  },
  {
    icon: DollarSign,
    title: 'Pricing Analysis',
    description:
      'Compare the discount to expected ranges for the type of damage present.',
  },
  {
    icon: Shield,
    title: 'Warranty Coverage',
    description:
      'Evaluate manufacturer and retailer warranty to understand your protection.',
  },
  {
    icon: Truck,
    title: 'Logistics',
    description:
      'Delivery recommendations based on appliance type and your situation.',
  },
]

const GOOD_DEALS = [
  'Hidden damage (back, sides) with 25%+ discount',
  'Full manufacturer warranty included',
  'Reasonable return window (14+ days)',
  'Independent retailer (negotiation possible)',
]

const RED_FLAGS = [
  'Rust, water stains, or unusual odors',
  'Missing parts or damaged power cord',
  "Final sale with no warranty coverage",
  'Visible damage with less than 15% discount',
]

export default function BuyersGuidePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-warm-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Should You Buy This Scratch & Dent Appliance?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Answer a few questions about the deal you&apos;re considering, and
              we&apos;ll give you a personalized recommendation on whether to
              proceed, negotiate, or walk away.
            </p>
          </div>
        </div>
      </section>

      {/* Wizard Section */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BuyerToolWizard />
        </div>
      </section>

      {/* Educational Section: What We Analyze */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            What Our Tool Analyzes
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            We evaluate multiple factors to give you a complete picture of the
            deal you&apos;re considering.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHAT_WE_ANALYZE.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100">
                  <Icon className="h-5 w-5 text-sage-600" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Section: Good Deals vs Red Flags */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Good Deals */}
            <div className="rounded-xl border border-sage-200 bg-sage-50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100">
                  <CheckCircle className="h-5 w-5 text-sage-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Signs of a Good Deal
                </h3>
              </div>
              <ul className="mt-4 space-y-3">
                {GOOD_DEALS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sage-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Red Flags */}
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Red Flags to Watch For
                </h3>
              </div>
              <ul className="mt-4 space-y-3">
                {RED_FLAGS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-8 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is scratch and dent?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Scratch and dent appliances have cosmetic damage (scratches,
                dents, scuffs) but are functionally perfect. They&apos;re
                typically floor models, returned items, or units damaged during
                shipping.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                How much should I expect to save?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Discounts typically range from 15-40% depending on damage
                visibility. Hidden damage (back, sides) often means 25-40% off,
                while visible front damage is usually 15-25% off.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is the warranty still valid?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                It depends. Many scratch and dent units retain full manufacturer
                warranty. Always ask the retailer to confirm warranty status
                before purchasing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I negotiate the price?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Often yes, especially at independent dealers and outlet stores.
                Big box stores have less flexibility, but it&apos;s always worth
                asking, especially for units that have been on the floor for a
                while.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What should I inspect before buying?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Check for rust, water stains, unusual odors, and damaged power
                cords. If possible, plug it in to verify it powers on and runs
                quietly. These issues indicate potential functional problems
                beyond cosmetic damage.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
