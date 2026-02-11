/**
 * City Deals Section Component
 *
 * Shows recent deals for a city on the city directory page.
 * Only renders when ENABLE_DEALS is true and deals exist.
 */

import Link from 'next/link'
import { getDealsByCity } from '@/lib/queries'
import { getDealsUrl, getDealPostUrl } from '@/lib/urls'
import { ENABLE_DEALS } from '@/lib/config'
import { DealCard } from './DealCard'

interface CityDealsSectionProps {
  city: string
  stateCode: string
}

export async function CityDealsSection({ city, stateCode }: CityDealsSectionProps) {
  if (!ENABLE_DEALS) return null

  const deals = await getDealsByCity(city, stateCode, 4)

  if (deals.length === 0) return null

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Deals in {city}
          </h2>
          <p className="mt-1 text-gray-600">
            Current scratch & dent deals from local retailers
          </p>
        </div>
        <Link
          href={`${getDealsUrl()}?state=${stateCode}`}
          className="text-sm text-sage-600 hover:text-sage-700"
        >
          View all deals &rarr;
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href={getDealPostUrl()}
          className="inline-flex items-center rounded-lg border border-sage-500 px-4 py-2 text-sm font-semibold text-sage-700 hover:bg-sage-50"
        >
          Have a deal? Post it for free
        </Link>
      </div>
    </section>
  )
}
