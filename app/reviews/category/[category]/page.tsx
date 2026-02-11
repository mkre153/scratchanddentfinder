/**
 * Review Category Page
 * Filters reviews by appliance category
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SITE_NAME, SITE_URL } from '@/lib/config'
import {
  getReviewsUrl,
  getReviewUrl,
  getReviewCategoryUrl,
} from '@/lib/urls'
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

const validCategories = [
  'refrigerators',
  'washers-dryers',
  'dishwashers',
  'ranges-ovens',
  'general',
] as const

const categoryLabels: Record<string, string> = {
  'refrigerators': 'Refrigerators',
  'washers-dryers': 'Washers & Dryers',
  'dishwashers': 'Dishwashers',
  'ranges-ovens': 'Ranges & Ovens',
  'general': 'General',
}

async function getReviews(): Promise<Review[]> {
  try {
    const { reviews } = await import('../../../../.velite/index.js')
    return reviews as Review[]
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return validCategories.map((category) => ({ category }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const label = categoryLabels[category]

  if (!label) {
    return { title: 'Category Not Found' }
  }

  const title = `${label} Reviews | ${SITE_NAME}`
  const description = `Video reviews and buying guides for the best ${label.toLowerCase()}. Watch or read — we summarize every video.`

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${getReviewCategoryUrl(category)}`,
    },
  }
}

function generateBreadcrumbSchema(category: string) {
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
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryLabels[category],
        item: `${SITE_URL}${getReviewCategoryUrl(category)}`,
      },
    ],
  }
}

export default async function ReviewCategoryPage({ params }: PageProps) {
  const { category } = await params

  if (!validCategories.includes(category as typeof validCategories[number])) {
    notFound()
  }

  const reviews = await getReviews()
  const filtered = reviews
    .filter((r) => !r.draft && r.category === category)
    .sort(
      (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
    )

  const label = categoryLabels[category]

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(category)} />

      <div className="pt-8 pb-16">
        {/* Header */}
        <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
          <nav className="mb-4 text-sm text-slate-500">
            <Link href="/" className="hover:text-sage-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={getReviewsUrl()} className="hover:text-sage-600">
              Reviews
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{label}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {label} Reviews
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Video reviews and expert summaries for the best {label.toLowerCase()}.
          </p>

          {/* Category filter links */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={getReviewsUrl()}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              All
            </Link>
            {Object.entries(categoryLabels).map(([key, name]) => (
              <Link
                key={key}
                href={getReviewCategoryUrl(key)}
                className={`inline-flex items-center px-3 py-1.5 text-sm rounded-full ${
                  key === category
                    ? 'bg-sage-100 text-sage-800 font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {name}
              </Link>
            ))}
          </div>
        </header>

        {/* Reviews Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <p className="text-slate-600">
              No {label.toLowerCase()} reviews yet. Check back soon!
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((review) => (
                <article
                  key={review.slug}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={getReviewUrl(review.slug)} className="block">
                    <img
                      src={`https://img.youtube.com/vi/${review.videoId}/mqdefault.jpg`}
                      alt={review.title}
                      className="w-full aspect-video object-cover"
                      loading="lazy"
                    />
                  </Link>

                  <Link href={getReviewUrl(review.slug)} className="block p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-sage-50 text-sage-700 rounded-full">
                        {label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {review.channelName}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                      {review.title}
                    </h2>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {review.description}
                    </p>

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
