/**
 * Deal Detail Page
 *
 * Shows full deal info, photos, pricing, and damage description.
 */

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getActiveDealById } from '@/lib/queries'
import { getDealsUrl, getDealUrl, getDealPostUrl } from '@/lib/urls'
import { getCanonicalUrl } from '@/lib/seo'
import { ENABLE_DEALS, SITE_URL, SITE_NAME } from '@/lib/config'
import { DealPhotoGallery } from '@/components/deals/DealPhotoGallery'
import { JsonLd } from '@/lib/schema'

interface DealPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: DealPageProps): Promise<Metadata> {
  if (!ENABLE_DEALS) return {}

  const { id } = await params
  const deal = await getActiveDealById(id)
  if (!deal) return {}

  const title = deal.title
  const description = `${deal.title} - ${formatPrice(deal.dealPrice)} in ${deal.city}, ${deal.state}. ${deal.damageDescription}`

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(getDealUrl(deal.id)),
    },
    openGraph: {
      title,
      description,
      url: getCanonicalUrl(getDealUrl(deal.id)),
      siteName: SITE_NAME,
      type: 'website',
    },
  }
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatCondition(condition: string): string {
  const labels: Record<string, string> = {
    new: 'New (unopened)',
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
    range: 'Range / Oven',
    microwave: 'Microwave',
    freezer: 'Freezer',
    other: 'Other',
  }
  return labels[type] || type
}

function generateProductSchema(deal: {
  id: string
  title: string
  description: string
  dealPrice: number
  originalPrice: number | null
  brand: string | null
  condition: string
  city: string
  state: string
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: deal.title,
    description: deal.description,
    offers: {
      '@type': 'Offer',
      price: (deal.dealPrice / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      itemCondition:
        deal.condition === 'new'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
      areaServed: {
        '@type': 'Place',
        name: `${deal.city}, ${deal.state}`,
      },
    },
  }

  if (deal.brand) {
    schema.brand = { '@type': 'Brand', name: deal.brand }
  }

  return schema
}

export default async function DealPage({ params }: DealPageProps) {
  if (!ENABLE_DEALS) {
    redirect('/')
  }

  const { id } = await params
  const deal = await getActiveDealById(id)

  if (!deal) {
    notFound()
  }

  const discount =
    deal.originalPrice && deal.dealPrice < deal.originalPrice
      ? Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100)
      : null

  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(deal.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  return (
    <>
      <JsonLd data={generateProductSchema(deal)} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href={getDealsUrl()} className="hover:text-sage-700">
            Deals
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{deal.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Photos */}
          <DealPhotoGallery photoPaths={deal.photoPaths} title={deal.title} />

          {/* Right: Details */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{deal.title}</h1>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-sage-700">
                {formatPrice(deal.dealPrice)}
              </span>
              {deal.originalPrice && deal.originalPrice > deal.dealPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(deal.originalPrice)}
                  </span>
                  {discount && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-700">
                      Save {discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Meta badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {formatApplianceType(deal.applianceType)}
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {formatCondition(deal.condition)}
              </span>
              {deal.brand && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  {deal.brand}
                </span>
              )}
            </div>

            {/* Location */}
            <div className="mt-4 flex items-center gap-2 text-gray-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{deal.city}, {deal.state}{deal.zip ? ` ${deal.zip}` : ''}</span>
            </div>

            {/* Expiry */}
            <p className="mt-2 text-sm text-gray-500">
              {daysRemaining > 0
                ? `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`
                : 'Expires soon'}
            </p>

            {/* Damage Description */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Damage Description</h2>
              <p className="mt-2 text-gray-700">{deal.damageDescription}</p>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">About This Deal</h2>
              <p className="mt-2 text-gray-700 whitespace-pre-line">{deal.description}</p>
            </div>

            {/* Model Number */}
            {deal.modelNumber && (
              <div className="mt-4">
                <span className="text-sm text-gray-500">Model: </span>
                <span className="text-sm font-medium text-gray-700">{deal.modelNumber}</span>
              </div>
            )}

            {/* Posted by */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Posted by <span className="font-medium text-gray-700">{deal.submitterName}</span>
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(deal.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 space-y-3">
              <Link
                href={getDealPostUrl()}
                className="block w-full rounded-lg border border-sage-500 py-3 text-center font-semibold text-sage-700 hover:bg-sage-50"
              >
                Post Your Own Deal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
