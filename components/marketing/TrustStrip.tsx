/**
 * TrustStrip Component
 *
 * Displays exactly 4 trust signals to reduce visitor skepticism.
 * Used on Homepage and State pages per UX template requirements.
 *
 * Template spec: Icons + short text only. No testimonials, no stats.
 */

import { CheckCircle, MapPin, RefreshCw, Tag } from 'lucide-react'

const trustItems = [
  {
    icon: CheckCircle,
    text: 'Verified stores',
    subtext: 'Every listing is reviewed',
  },
  {
    icon: MapPin,
    text: 'Nationwide coverage',
    subtext: 'Stores across major U.S. markets',
  },
  {
    icon: RefreshCw,
    text: 'Continuously updated',
    subtext: 'New stores added regularly',
  },
  {
    icon: Tag,
    text: 'Featured listings disclosed',
    subtext: 'Paid placements are clearly marked',
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
