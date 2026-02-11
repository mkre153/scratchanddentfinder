/**
 * Deal Post Page (Server Component)
 *
 * Upload form for retailers to post scratch & dent deals.
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { generatePageMetadata } from '@/lib/seo'
import { getDealPostUrl, getDealsUrl } from '@/lib/urls'
import { ENABLE_DEALS } from '@/lib/config'
import { DealPostForm } from './form'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return generatePageMetadata(
    'Post Your Deal',
    'List your scratch and dent appliance deal for free. Reach thousands of bargain shoppers looking for discounted appliances.',
    getDealPostUrl()
  )
}

export default function DealPostPage() {
  if (!ENABLE_DEALS) {
    redirect('/')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href={getDealsUrl()}
          className="text-sm text-sage-600 hover:text-sage-700"
        >
          &larr; Back to Deals
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Post Your Deal</h1>
        <p className="mt-2 text-gray-600">
          List your scratch and dent appliance deal for free. Reach thousands of shoppers looking for discounted appliances.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <DealPostForm />
      </div>
    </div>
  )
}
