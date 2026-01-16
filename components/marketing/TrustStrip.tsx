/**
 * TrustStrip Component
 *
 * Displays exactly 4 trust signals to reduce visitor skepticism.
 * Used on Homepage and State pages per UX template requirements.
 *
 * Template spec: Icons + short text only. No testimonials, no stats.
 */

import { CheckCircle, Ban, RefreshCw, Gift } from 'lucide-react'

const trustItems = [
  {
    icon: CheckCircle,
    text: 'Real local stores',
    subtext: 'No fake listings',
  },
  {
    icon: Ban,
    text: 'No paid rankings',
    subtext: "Results aren't bought",
  },
  {
    icon: RefreshCw,
    text: 'Updated regularly',
    subtext: 'Fresh data weekly',
  },
  {
    icon: Gift,
    text: 'Free to use',
    subtext: 'Always 100% free',
  },
]

export function TrustStrip() {
  return (
    <section className="border-y border-gray-100 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {trustItems.map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <item.icon className="h-5 w-5 flex-shrink-0 text-sage-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{item.text}</p>
                <p className="text-xs text-gray-500">{item.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
