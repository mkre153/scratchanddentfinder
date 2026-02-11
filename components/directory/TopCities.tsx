import Link from 'next/link'
import { getCityUrl } from '@/lib/urls'
import type { State, City } from '@/lib/types'

interface TopCitiesProps {
  cities: City[]
  state: State
}

export function TopCities({ cities, state }: TopCitiesProps) {
  const topCities = [...cities]
    .sort((a, b) => b.storeCount - a.storeCount)
    .slice(0, 5)

  if (topCities.length === 0) return null

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Top Cities for Scratch & Dent in {state.name}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {topCities.map((city) => (
            <Link
              key={city.id}
              href={getCityUrl(state, city)}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow"
            >
              <span className="font-medium text-gray-900">{city.name}</span>
              <span className="text-sm text-gray-500">
                {city.storeCount} {city.storeCount === 1 ? 'store' : 'stores'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
