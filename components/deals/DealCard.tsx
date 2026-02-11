/**
 * Deal Card Component
 *
 * Displays a deal in grid/list views.
 */

import Link from 'next/link'
import { getDealUrl } from '@/lib/urls'
import type { Deal } from '@/lib/types'

interface DealCardProps {
  deal: Deal
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatCondition(condition: string): string {
  const labels: Record<string, string> = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
  }
  return labels[condition] || condition
}

function formatApplianceType(type: string): string {
  const labels: Record<string, string> = {
    refrigerator: 'Refrigerator',
    washer: 'Washer',
    dryer: 'Dryer',
    dishwasher: 'Dishwasher',
    range: 'Range',
    microwave: 'Microwave',
    freezer: 'Freezer',
    other: 'Other',
  }
  return labels[type] || type
}

function getPhotoUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/deal-photos/${path}`
}

export function DealCard({ deal }: DealCardProps) {
  const discount =
    deal.originalPrice && deal.dealPrice < deal.originalPrice
      ? Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100)
      : null

  return (
    <Link
      href={getDealUrl(deal.id)}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {deal.photoPaths.length > 0 ? (
          <img
            src={getPhotoUrl(deal.photoPaths[0])}
            alt={deal.title}
            className="h-full w-full object-cover group-hover:opacity-95 transition"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Discount badge */}
        {discount && discount > 0 && (
          <div className="absolute top-2 left-2 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
            {discount}% OFF
          </div>
        )}

        {/* Photo count */}
        {deal.photoPaths.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            {deal.photoPaths.length} photos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-sage-700 transition">
            {deal.title}
          </h3>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold text-sage-700">{formatPrice(deal.dealPrice)}</span>
          {deal.originalPrice && deal.originalPrice > deal.dealPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(deal.originalPrice)}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {formatApplianceType(deal.applianceType)}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {formatCondition(deal.condition)}
          </span>
        </div>

        {/* Location */}
        <p className="mt-2 text-sm text-gray-500">
          {deal.city}, {deal.state}
          {deal.brand && <span className="ml-1">| {deal.brand}</span>}
        </p>
      </div>
    </Link>
  )
}
