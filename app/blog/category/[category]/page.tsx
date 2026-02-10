/**
 * Blog Category Archive Page
 * Lists posts filtered by category
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SITE_NAME, SITE_URL } from '@/lib/config'
import { getBlogUrl, getBlogPostUrl, getBlogCategoryUrl } from '@/lib/urls'
import { JsonLd } from '@/lib/schema'

const CATEGORIES: Record<string, string> = {
  'buying-guides': 'Buying Guides',
  'savings-tips': 'Savings Tips',
  'product-guides': 'Product Guides',
  'shopping-strategies': 'Shopping Strategies',
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
  readingTime: string
}

async function getPosts(): Promise<Post[]> {
  try {
    const { posts } = await import('../../../../.velite/index.js')
    return posts as Post[]
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const label = CATEGORIES[category]

  if (!label) return { title: 'Category Not Found' }

  return {
    title: `${label} | Blog | ${SITE_NAME}`,
    description: `Browse ${label.toLowerCase()} for scratch and dent appliances. Tips, guides, and strategies to save money.`,
    alternates: {
      canonical: `${SITE_URL}${getBlogCategoryUrl(category)}`,
    },
  }
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params
  const label = CATEGORIES[category]

  if (!label) notFound()

  const posts = await getPosts()
  const filteredPosts = posts
    .filter((post) => !post.draft && post.category === category)
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}${getBlogUrl()}` },
      { '@type': 'ListItem', position: 3, name: label, item: `${SITE_URL}${getBlogCategoryUrl(category)}` },
    ],
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <div className="pt-8 pb-16">
        <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
          <nav className="mb-4 text-sm text-slate-500">
            <Link href="/" className="hover:text-sage-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href={getBlogUrl()} className="hover:text-sage-600">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{label}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {label}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} in this category
          </p>

          {/* Category filter links */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={getBlogUrl()}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              All
            </Link>
            {Object.entries(CATEGORIES).map(([key, name]) => (
              <Link
                key={key}
                href={getBlogCategoryUrl(key)}
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

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <p className="text-slate-600">
              No posts in this category yet. Check back soon!
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={getBlogPostUrl(post.slug)} className="block p-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-sage-50 text-sage-700 rounded-full mb-3">
                      {label}
                    </span>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        {new Date(post.updated).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{post.readingTime}</span>
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
