/**
 * Deals Browse Page
 *
 * Browse active deals with filters for state and appliance type.
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { generatePageMetadata } from '@/lib/seo'
import { getDealsUrl, getDealPostUrl } from '@/lib/urls'
import { ENABLE_DEALS } from '@/lib/config'
import { getActiveDeals } from '@/lib/queries'
import { DealCard } from '@/components/deals/DealCard'
import { DealFilters } from '@/components/deals/DealFilters'

export function generateMetadata(): Metadata {
  return generatePageMetadata(
    'Scratch & Dent Deals',
    'Browse real scratch and dent appliance deals posted by retailers. Save 30-70% on refrigerators, washers, dryers, and more.',
    getDealsUrl()
  )
}

interface DealsPageProps {
  searchParams: Promise<{ state?: string; type?: string; page?: string }>
}

async function DealsContent({ searchParams }: DealsPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  const { deals, total } = await getActiveDeals({
    state: params.state,
    applianceType: params.type,
    limit,
    offset,
  })

  const totalPages = Math.ceil(total / limit)

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Suspense fallback={null}>
          <DealFilters />
        </Suspense>
        <p className="text-sm text-gray-500">
          {total} deal{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Deals Grid */}
      {deals.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No deals yet</h3>
          <p className="mt-2 text-gray-600">
            Be the first to post a deal in this area!
          </p>
          <Link
            href={getDealPostUrl()}
            className="mt-4 inline-flex rounded-lg bg-sage-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sage-700"
          >
            Post a Deal
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/deals/?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          <span className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/deals/?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </>
  )
}

export default function DealsPage(props: DealsPageProps) {
  if (!ENABLE_DEALS) {
    redirect('/')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scratch & Dent Deals</h1>
          <p className="mt-2 text-gray-600">
            Real deals posted by retailers. Save 30-70% on appliances with minor cosmetic damage.
          </p>
        </div>
        <Link
          href={getDealPostUrl()}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-yellow-400 px-4 font-semibold text-gray-900 hover:bg-yellow-500"
        >
          Post Your Deal
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-gray-200">
                <div className="aspect-[4/3] bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <DealsContent {...props} />
      </Suspense>
    </div>
  )
}
