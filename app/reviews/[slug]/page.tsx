/**
 * Review Detail Page
 * Renders individual appliance review with YouTube embed + MDX summary
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { compileMDX } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/components/mdx'
import { SITE_NAME, SITE_URL } from '@/lib/config'
import {
  getReviewsUrl,
  getReviewUrl,
  getReviewCategoryUrl,
  getAllStatesUrl,
} from '@/lib/urls'
import { JsonLd } from '@/lib/schema'

interface Takeaways {
  what: string
  tips: string[]
}

interface Keywords {
  primary: string
  secondary?: string[]
}

interface Review {
  slug: string
  title: string
  description: string
  date: string
  updated: string
  category: string
  videoId: string
  videoTitle: string
  channelName: string
  videoDuration: string
  draft: boolean
  readingTime: string
  body: string
  raw: string
  keywords?: Keywords
  takeaways?: Takeaways
}

async function getReviews(): Promise<Review[]> {
  try {
    const { reviews } = await import('../../../.velite/index.js')
    return reviews as Review[]
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const reviews = await getReviews()
  return reviews.filter((r) => !r.draft).map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const reviews = await getReviews()
  const review = reviews.find((r) => r.slug === slug && !r.draft)

  if (!review) {
    return { title: 'Review Not Found' }
  }

  return {
    title: `${review.title} | ${SITE_NAME}`,
    description: review.description,
    alternates: {
      canonical: `${SITE_URL}${getReviewUrl(review.slug)}`,
    },
    openGraph: {
      title: review.title,
      description: review.description,
      url: `${SITE_URL}${getReviewUrl(review.slug)}`,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: review.date,
      modifiedTime: review.updated,
    },
  }
}

const categoryLabels: Record<string, string> = {
  'refrigerators': 'Refrigerators',
  'washers-dryers': 'Washers & Dryers',
  'dishwashers': 'Dishwashers',
  'ranges-ovens': 'Ranges & Ovens',
  'general': 'General',
}

/** Map category to a relevant CTA label */
const categoryCta: Record<string, string> = {
  'refrigerators': 'Find discounted refrigerators near you',
  'washers-dryers': 'Find discounted washers & dryers near you',
  'dishwashers': 'Find discounted dishwashers near you',
  'ranges-ovens': 'Find discounted ranges & ovens near you',
  'general': 'Find discounted appliances near you',
}

function generateArticleSchema(review: Review) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: review.title,
    description: review.description,
    datePublished: review.date,
    dateModified: review.updated,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

function generateVideoSchema(review: Review) {
  // Parse duration "18:32" → ISO 8601 "PT18M32S"
  const parts = review.videoDuration.split(':')
  let isoDuration = 'PT'
  if (parts.length === 3) {
    isoDuration += `${parseInt(parts[0])}H${parseInt(parts[1])}M${parseInt(parts[2])}S`
  } else if (parts.length === 2) {
    isoDuration += `${parseInt(parts[0])}M${parseInt(parts[1])}S`
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: review.videoTitle,
    description: review.description,
    thumbnailUrl: `https://img.youtube.com/vi/${review.videoId}/maxresdefault.jpg`,
    uploadDate: review.date,
    duration: isoDuration,
    embedUrl: `https://www.youtube-nocookie.com/embed/${review.videoId}`,
    contentUrl: `https://www.youtube.com/watch?v=${review.videoId}`,
  }
}

function generateBreadcrumbSchema(review: Review) {
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
        name: review.title,
        item: `${SITE_URL}${getReviewUrl(review.slug)}`,
      },
    ],
  }
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { slug } = await params
  const reviews = await getReviews()
  const review = reviews.find((r) => r.slug === slug && !r.draft)

  if (!review) {
    notFound()
  }

  const { content } = await compileMDX({
    source: review.body,
    components: mdxComponents,
  })

  // Get related reviews (same category, excluding current)
  const related = reviews
    .filter((r) => !r.draft && r.category === review.category && r.slug !== review.slug)
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
    .slice(0, 3)

  return (
    <>
      {/* Schema markup */}
      <JsonLd data={generateArticleSchema(review)} />
      <JsonLd data={generateVideoSchema(review)} />
      <JsonLd data={generateBreadcrumbSchema(review)} />

      <article className="pt-8 pb-16">
        {/* Header */}
        <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-sage-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={getReviewsUrl()} className="hover:text-sage-600">
              Reviews
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{review.title}</span>
          </nav>

          {/* Category + Channel + Duration */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Link
              href={getReviewCategoryUrl(review.category)}
              className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-sage-50 text-sage-700 rounded-full hover:bg-sage-100"
            >
              {categoryLabels[review.category] || review.category}
            </Link>
            <span className="text-sm text-slate-500">{review.channelName}</span>
            <span className="text-sm text-slate-400">{review.videoDuration}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 max-w-2xl">
            {review.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-slate-600 max-w-2xl mb-4">
            {review.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>
              Updated{' '}
              {new Date(review.updated).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{review.readingTime}</span>
          </div>
        </header>

        {/* Key Takeaways */}
        {review.takeaways && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
            <div className="bg-sage-50 border border-sage-100 rounded-xl p-6 max-w-2xl">
              <h2 className="text-sm font-semibold text-sage-800 mb-4 uppercase tracking-wide">
                Key Takeaways
              </h2>
              <p className="font-medium text-slate-900 mb-4">
                {review.takeaways.what}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {review.takeaways.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-slate-700">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Main Content (MDX body with embedded YouTube) */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl prose prose-slate prose-lg prose-headings:scroll-mt-24">
            {content}
          </div>
        </div>

        {/* CTA: Find discounted appliances */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-2xl">
            <Link
              href={getAllStatesUrl()}
              className="block p-6 bg-sage-50 hover:bg-sage-100 rounded-xl transition-colors border border-sage-100 text-center"
            >
              <span className="text-xs text-sage-600 uppercase tracking-wide font-medium">
                Ready to Save?
              </span>
              <span className="block mt-2 text-lg font-semibold text-slate-900">
                {categoryCta[review.category] || categoryCta['general']} →
              </span>
            </Link>
          </div>
        </section>

        {/* Related Reviews */}
        {related.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">
                More Reviews
              </h2>
              <div className="grid gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={getReviewUrl(r.slug)}
                    className="block p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-sage-700 font-medium">
                        {categoryLabels[r.category] || r.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {r.channelName}
                      </span>
                    </div>
                    <span className="font-medium text-slate-900">
                      {r.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  )
}
