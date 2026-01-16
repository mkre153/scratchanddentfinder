/**
 * BuyerTips Component
 *
 * Displays max 3 tips to reduce buyer anxiety.
 * Used on City pages per UX template requirements.
 *
 * Template spec: Max 3 bullets about inspection, warranty, delivery.
 */

import { Eye, Shield, Truck } from 'lucide-react'

const tips = [
  {
    icon: Eye,
    text: 'Inspect the cosmetic damage in person before buying',
  },
  {
    icon: Shield,
    text: 'Ask about warranty coverage and return policies',
  },
  {
    icon: Truck,
    text: 'Confirm delivery options and installation services',
  },
]

export function BuyerTips() {
  return (
    <section className="bg-warm-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Tips for Buying Scratch & Dent
        </h2>

        <ul className="space-y-3">
          {tips.map((tip) => (
            <li key={tip.text} className="flex items-start gap-3">
              <tip.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-sage-600" />
              <span className="text-sm text-gray-700">{tip.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
