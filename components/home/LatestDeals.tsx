import Link from 'next/link'
import { getDealsUrl } from '@/lib/urls'
import type { Deal } from '@/lib/types'

interface LatestDealsProps {
  deals: Deal[]
}

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
}

export function LatestDeals({ deals }: LatestDealsProps) {
  if (deals.length === 0) return null

  return (
    <section className="py-12 bg-amber-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Latest Deals
          </h2>
          <Link
            href={getDealsUrl()}
            className="text-sm font-medium text-sage-700 hover:text-sage-800"
          >
            View all deals &rarr;
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {deals.map((deal) => (
            <Link
              key={deal.id}
              href={getDealsUrl()}
              className="block rounded-lg bg-white p-6 shadow-sm border border-amber-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {deal.applianceType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
                {deal.condition && (
                  <span className="text-xs text-gray-500">
                    {conditionLabels[deal.condition] || deal.condition}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {deal.title}
              </h3>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-lg font-bold text-sage-700">
                  ${deal.dealPrice.toLocaleString()}
                </span>
                {deal.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ${deal.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {deal.city}, {deal.state}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
