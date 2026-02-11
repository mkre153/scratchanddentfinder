/**
 * Reviews Index Page
 * Grid of all published appliance video reviews
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_NAME, SITE_URL } from '@/lib/config'
import { getReviewsUrl, getReviewUrl, getReviewCategoryUrl } from '@/lib/urls'
import { JsonLd } from '@/lib/schema'

interface Review {
  slug: string
  title: string
  description: string
  date: string
  updated: string
  category: string
  videoId: string
  channelName: string
  videoDuration: string
  draft: boolean
  readingTime: string
}

async function getReviews(): Promise<Review[]> {
  try {
    const { reviews } = await import('../../.velite/index.js')
    return reviews as Review[]
  } catch {
    return []
  }
}

export const metadata: Metadata = {
  title: `Appliance Reviews | ${SITE_NAME}`,
  description:
    'Video reviews and summaries of the best refrigerators, washers, dryers, dishwashers, and more. Watch or read — we outline every video so you don\'t have to.',
  alternates: {
    canonical: `${SITE_URL}${getReviewsUrl()}`,
  },
}

const categoryLabels: Record<string, string> = {
  'refrigerators': 'Refrigerators',
  'washers-dryers': 'Washers & Dryers',
  'dishwashers': 'Dishwashers',
  'ranges-ovens': 'Ranges & Ovens',
  'general': 'General',
}

function generateBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Reviews',
        item: `${SITE_URL}${getReviewsUrl()}`,
      },
    ],
  }
}

export default async function ReviewsPage() {
  const reviews = await getReviews()
  const publishedReviews = reviews
    .filter((r) => !r.draft)
    .sort(
      (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
    )

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema()} />

      <div className="pt-8 pb-16">
        {/* Header */}
        <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
          <nav className="mb-4 text-sm text-slate-500">
            <Link href="/" className="hover:text-sage-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">Reviews</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Appliance Reviews
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            We watch top appliance review videos and write detailed summaries so
            you can research faster. Find the best deals on scratch & dent
            versions of these top-rated appliances.
          </p>

          {/* Category filter links */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-sage-100 text-sage-800 font-medium">
              All
            </span>
            {Object.entries(categoryLabels).map(([key, name]) => (
              <Link
                key={key}
                href={getReviewCategoryUrl(key)}
                className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                {name}
              </Link>
            ))}
          </div>
        </header>

        {/* Reviews Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {publishedReviews.length === 0 ? (
            <p className="text-slate-600">
              No reviews yet. Check back soon!
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {publishedReviews.map((review) => (
                <article
                  key={review.slug}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <Link href={getReviewUrl(review.slug)} className="block">
                    <img
                      src={`https://img.youtube.com/vi/${review.videoId}/mqdefault.jpg`}
                      alt={review.title}
                      className="w-full aspect-video object-cover"
                      loading="lazy"
                    />
                  </Link>

                  <Link href={getReviewUrl(review.slug)} className="block p-6">
                    {/* Category + Channel */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-sage-50 text-sage-700 rounded-full">
                        {categoryLabels[review.category] || review.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {review.channelName}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                      {review.title}
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {review.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        {new Date(review.updated).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{review.videoDuration} video</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{review.readingTime}</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
