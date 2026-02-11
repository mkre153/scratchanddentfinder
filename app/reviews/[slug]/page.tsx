/**
 * Review Detail Page
 * Multi-source expert consensus + S&D buying intelligence
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
import { AdUnit } from '@/components/ads/AdUnit'

interface Source {
  videoId: string
  videoTitle: string
  channelName: string
  videoDuration: string
  strength: string
  gap: string
}

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
  sources: Source[]
  sdAvailability: 'common' | 'limited' | 'rare'
  retailPrice?: string
  sdPriceRange?: string
  damageTolerance?: string[]
  inspectionTips?: string[]
  notFor?: string
  verdict: string
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

const categoryCta: Record<string, string> = {
  'refrigerators': 'Find discounted refrigerators near you',
  'washers-dryers': 'Find discounted washers & dryers near you',
  'dishwashers': 'Find discounted dishwashers near you',
  'ranges-ovens': 'Find discounted ranges & ovens near you',
  'general': 'Find discounted appliances near you',
}

const availabilityConfig: Record<string, { label: string; bars: number }> = {
  'common': { label: 'Common', bars: 8 },
  'limited': { label: 'Limited', bars: 5 },
  'rare': { label: 'Rare', bars: 2 },
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

function parseDuration(duration: string): string {
  const parts = duration.split(':')
  let isoDuration = 'PT'
  if (parts.length === 3) {
    isoDuration += `${parseInt(parts[0])}H${parseInt(parts[1])}M${parseInt(parts[2])}S`
  } else if (parts.length === 2) {
    isoDuration += `${parseInt(parts[0])}M${parseInt(parts[1])}S`
  }
  return isoDuration
}

function generateVideoSchemas(review: Review) {
  return review.sources.map((source) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: source.videoTitle,
    description: review.description,
    thumbnailUrl: `https://img.youtube.com/vi/${source.videoId}/maxresdefault.jpg`,
    uploadDate: review.date,
    duration: parseDuration(source.videoDuration),
    embedUrl: `https://www.youtube-nocookie.com/embed/${source.videoId}`,
    contentUrl: `https://www.youtube.com/watch?v=${source.videoId}`,
  }))
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

  const related = reviews
    .filter((r) => !r.draft && r.category === review.category && r.slug !== review.slug)
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
    .slice(0, 3)

  const videoSchemas = generateVideoSchemas(review)
  const availability = availabilityConfig[review.sdAvailability]

  return (
    <>
      {/* Schema markup */}
      <JsonLd data={generateArticleSchema(review)} />
      {videoSchemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
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

          {/* Category + Source Count */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Link
              href={getReviewCategoryUrl(review.category)}
              className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-sage-50 text-sage-700 rounded-full hover:bg-sage-100"
            >
              {categoryLabels[review.category] || review.category}
            </Link>
            <span className="text-sm text-slate-500">
              {review.sources.length} expert source{review.sources.length !== 1 ? 's' : ''} reviewed
            </span>
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

        {/* SECTION 1: Expert Consensus */}
        {review.takeaways && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
            <div className="bg-sage-50 border border-sage-100 rounded-xl p-6 max-w-2xl">
              <h2 className="text-sm font-semibold text-sage-800 mb-4 uppercase tracking-wide">
                What the Experts Agree On
              </h2>
              <ul className="space-y-2">
                {review.takeaways.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-sage-600 mt-0.5 shrink-0">&#10003;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Ad Unit 1: After Expert Consensus */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-2xl">
            <AdUnit slot="review-top" format="horizontal" />
          </div>
        </div>

        {/* MDX Body — Expert consensus, disagreements, inline embeds */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl prose prose-slate prose-lg prose-headings:scroll-mt-24">
            {content}
          </div>
        </div>

        {/* SECTION 2: Sources We Reviewed */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Sources We Reviewed
            </h2>
            <div className="space-y-4">
              {review.sources.map((source, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg"
                >
                  <a
                    href={`https://www.youtube.com/watch?v=${source.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${source.videoId}/mqdefault.jpg`}
                      alt={source.videoTitle}
                      className="w-32 sm:w-40 aspect-video object-cover rounded"
                      loading="lazy"
                    />
                  </a>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-medium text-slate-700">{source.channelName}</span>
                      <span>{source.videoDuration}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-2 line-clamp-2">
                      {source.videoTitle}
                    </p>
                    <p className="text-xs text-slate-600 mb-1">
                      <span className="text-sage-600">Strength:</span> {source.strength}
                    </p>
                    <p className="text-xs text-slate-600 mb-2">
                      <span className="text-amber-600">Gap:</span> {source.gap}
                    </p>
                    <a
                      href={`https://www.youtube.com/watch?v=${source.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-sage-700 hover:text-sage-800"
                    >
                      Watch on YouTube &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: S&D Reality Layer */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-2xl bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-sm font-bold text-amber-900 mb-5 uppercase tracking-wide">
              S&D Buying Intelligence
            </h2>

            {/* Availability bar */}
            <div className="mb-4">
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Availability
              </span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm ${
                        i < availability.bars
                          ? 'bg-amber-500'
                          : 'bg-amber-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {availability.label}
                </span>
              </div>
            </div>

            {/* Price ranges */}
            {(review.retailPrice || review.sdPriceRange) && (
              <div className="grid grid-cols-2 gap-4 mb-5">
                {review.retailPrice && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Retail
                    </span>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {review.retailPrice}
                    </p>
                  </div>
                )}
                {review.sdPriceRange && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      S&D Price
                    </span>
                    <p className="text-sm font-semibold text-amber-700 mt-0.5">
                      {review.sdPriceRange}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Damage Tolerance */}
            {review.damageTolerance && review.damageTolerance.length > 0 && (
              <div className="mb-5">
                <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  Damage Tolerance
                </span>
                <ul className="mt-2 space-y-1.5">
                  {review.damageTolerance.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="shrink-0">&#8226;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inspection Checklist */}
            {review.inspectionTips && review.inspectionTips.length > 0 && (
              <div className="mb-5">
                <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  Inspection Checklist
                </span>
                <ul className="mt-2 space-y-1.5">
                  {review.inspectionTips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="shrink-0 text-slate-400">&#9744;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Not For */}
            {review.notFor && (
              <div>
                <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                  Skip If
                </span>
                <p className="text-sm text-slate-700 mt-1">{review.notFor}</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: SDF Verdict */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
          <div className="max-w-2xl bg-sage-50 border border-sage-200 rounded-xl p-6">
            <h2 className="text-xs font-bold text-sage-800 mb-2 uppercase tracking-wide">
              SDF Verdict
            </h2>
            <p className="text-base font-medium text-slate-900 italic">
              &ldquo;{review.verdict}&rdquo;
            </p>
          </div>
        </section>

        {/* Ad Unit 2: Before CTA */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
          <div className="max-w-2xl">
            <AdUnit slot="review-bottom" format="horizontal" />
          </div>
        </div>

        {/* CTA */}
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
                {categoryCta[review.category] || categoryCta['general']} &rarr;
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
                        {r.sources.length} source{r.sources.length !== 1 ? 's' : ''}
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
