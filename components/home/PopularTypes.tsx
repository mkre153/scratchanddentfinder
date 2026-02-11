import Link from 'next/link'
import { getAllStatesUrl } from '@/lib/urls'

const APPLIANCE_TYPES = [
  { name: 'Refrigerators', icon: '🧊', description: 'French door, side-by-side, and top-freezer models at 30-60% off retail' },
  { name: 'Washers & Dryers', icon: '🫧', description: 'Front-load, top-load, and stackable sets with cosmetic-only damage' },
  { name: 'Ranges & Ovens', icon: '🔥', description: 'Gas, electric, and dual-fuel ranges with minor dents or scratches' },
  { name: 'Dishwashers', icon: '🍽️', description: 'Built-in and portable dishwashers at steep discounts' },
  { name: 'Microwaves', icon: '📡', description: 'Over-the-range and countertop models from top brands' },
  { name: 'Freezers', icon: '❄️', description: 'Chest and upright freezers — great for bulk storage' },
]

export function PopularTypes() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          Popular Scratch & Dent Appliance Types
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          The most commonly available scratch and dent appliances — all fully functional with minor cosmetic imperfections.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPLIANCE_TYPES.map((type) => (
            <Link
              key={type.name}
              href={getAllStatesUrl()}
              className="flex items-start gap-4 rounded-lg bg-white p-5 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl" role="img" aria-label={type.name}>
                {type.icon}
              </span>
              <div>
                <h3 className="font-semibold text-gray-900">{type.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{type.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
