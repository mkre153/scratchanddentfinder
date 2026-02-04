/**
 * Blog Post Detail Page
 * Renders individual blog posts with MDX content
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { compileMDX } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/components/mdx'
import { SITE_NAME, SITE_URL } from '@/lib/config'
import { getBlogUrl, getBlogPostUrl, getBuyersGuideUrl } from '@/lib/urls'
import { JsonLd } from '@/lib/schema'

// Type for blog posts from velite
interface FAQ {
  q: string
  a: string
}

interface Takeaways {
  what: string
  tips: string[]
}

interface Keywords {
  primary: string
  secondary?: string[]
}

interface Post {
  slug: string
  title: string
  description: string
  date: string
  updated: string
  category: string
  tags: string[]
  draft: boolean
  guideLink: string
  stateLink?: string
  toc: boolean
  readingTime: string
  body: string
  raw: string
  brief: string
  keywords?: Keywords
  takeaways?: Takeaways
  faqs?: FAQ[]
}

// Dynamic import for velite content
async function getPosts(): Promise<Post[]> {
  try {
    const { posts } = await import('../../../.velite/index.js')
    return posts as Post[]
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all non-draft posts
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.filter((post) => !post.draft).map((post) => ({ slug: post.slug }))
}

// Generate metadata for each post
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const posts = await getPosts()
  const post = posts.find((p) => p.slug === slug && !p.draft)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description,
    keywords: post.tags.join(', '),
    alternates: {
      canonical: `${SITE_URL}${getBlogPostUrl(post.slug)}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}${getBlogPostUrl(post.slug)}`,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated,
    },
  }
}

// Generate Article schema for structured data
function generateArticleSchema(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated,
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

function generateBreadcrumbSchema(post: Post) {
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
        name: 'Blog',
        item: `${SITE_URL}${getBlogUrl()}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}${getBlogPostUrl(post.slug)}`,
      },
    ],
  }
}

// Generate FAQPage schema for structured data (AEO optimization)
function generateFAQSchema(faqs: FAQ[]) {
  if (!faqs || faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const posts = await getPosts()
  const post = posts.find((p) => p.slug === slug && !p.draft)

  if (!post) {
    notFound()
  }

  // Compile MDX content server-side
  const { content } = await compileMDX({
    source: post.body,
    components: mdxComponents,
  })

  const articleSchema = generateArticleSchema(post)
  const breadcrumbSchema = generateBreadcrumbSchema(post)
  const faqSchema = post.faqs ? generateFAQSchema(post.faqs) : null

  // Extract headings for ToC if enabled
  const headings = post.toc
    ? (post.raw.match(/^#{2,3}\s+.+$/gm) || []).map((h) => {
        const level = h.match(/^#+/)?.[0].length || 2
        const text = h.replace(/^#+\s+/, '')
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        return { level, text, id }
      })
    : []

  const categoryLabels: Record<string, string> = {
    'buying-guides': 'Buying Guides',
    'savings-tips': 'Savings Tips',
    'product-guides': 'Product Guides',
    'shopping-strategies': 'Shopping Strategies',
  }

  return (
    <>
      {/* Structured Data */}
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <article className="pt-8 pb-16">
        {/* Header */}
        <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-sage-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={getBlogUrl()} className="hover:text-sage-600">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{post.title}</span>
          </nav>

          {/* Category badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-sage-50 text-sage-700 rounded-full mb-4">
            {categoryLabels[post.category] || post.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 max-w-2xl">
            {post.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-slate-600 max-w-2xl mb-4">
            {post.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>
              Updated{' '}
              {new Date(post.updated).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{post.readingTime}</span>
          </div>
        </header>

        {/* Table of Contents (opt-in) */}
        {post.toc && headings.length > 0 && (
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
            <div className="bg-slate-50 rounded-xl p-6 max-w-2xl">
              <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                In This Article
              </h2>
              <ul className="space-y-2">
                {headings.map((heading, idx) => (
                  <li
                    key={idx}
                    style={{ paddingLeft: `${(heading.level - 2) * 16}px` }}
                  >
                    <a
                      href={`#${heading.id}`}
                      className="text-sm text-slate-600 hover:text-sage-600 transition-colors"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}

        {/* Key Takeaways Section (AEO-optimized summary) */}
        {post.takeaways && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
            <div className="bg-sage-50 border border-sage-100 rounded-xl p-6 max-w-2xl">
              <h2 className="text-sm font-semibold text-sage-800 mb-4 uppercase tracking-wide">
                Key Takeaways
              </h2>
              <p className="font-medium text-slate-900 mb-4">
                {post.takeaways.what}
              </p>
              <p className="text-sm font-medium text-slate-600 mb-2">
                Quick tips:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {post.takeaways.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-slate-700">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl prose prose-slate prose-lg prose-headings:scroll-mt-24">
            {content}
          </div>
        </div>

        {/* FAQ Section (renders from structured frontmatter for AEO) */}
        {post.faqs && post.faqs.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {post.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="border-b border-slate-200 pb-6 last:border-0"
                  >
                    <h3 className="font-medium text-slate-900 mb-2">{faq.q}</h3>
                    <p className="text-slate-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Guide & State Links */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Continue Learning
            </h2>
            <div className="grid gap-4">
              <Link
                href={post.guideLink || getBuyersGuideUrl()}
                className="block p-4 bg-sage-50 hover:bg-sage-100 rounded-lg transition-colors border border-sage-100"
              >
                <span className="text-xs text-sage-600 uppercase tracking-wide font-medium">
                  Complete Guide
                </span>
                <span className="block mt-1 font-medium text-slate-900">
                  Buyer&apos;s Guide to Scratch & Dent Appliances →
                </span>
              </Link>
              {post.stateLink && (
                <Link
                  href={post.stateLink}
                  className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    Find Stores
                  </span>
                  <span className="block mt-1 font-medium text-slate-900">
                    Browse Scratch & Dent Stores Near You →
                  </span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Tags */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 text-sm bg-slate-100 text-slate-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      </article>
    </>
  )
}
