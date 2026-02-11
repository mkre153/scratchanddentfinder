/**
 * Dynamic Sitemap
 *
 * Generates sitemap.xml for all indexed pages.
 * Uses lib/urls.ts for all route generation (Gate 5).
 */

import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/config'
import {
  getHomepageUrl,
  getAllStatesUrl,
  getStateUrl,
  getCityUrl,
  getAboutUrl,
  getContactUrl,
  getStoreSubmitUrl,
  getBuyersGuideUrl,
  getFaqUrl,
  getWhatIsScratchAndDentUrl,
  getBlogUrl,
  getBlogPostUrl,
  getReviewsUrl,
  getReviewUrl,
  getDealsUrl,
  getDealPostUrl,
} from '@/lib/urls'
import { ENABLE_DEALS } from '@/lib/config'
import { shouldIndexState, shouldIndexCity } from '@/lib/seo'
import { getAllStates, getCitiesByStateId } from '@/lib/queries'

// Types for velite content
interface Post {
  slug: string
  draft: boolean
  updated: string
}

interface ReviewEntry {
  slug: string
  draft: boolean
  updated: string
}

async function getBlogPosts(): Promise<Post[]> {
  try {
    const { posts } = await import('../.velite/index.js')
    return posts as Post[]
  } catch {
    return []
  }
}

async function getReviewEntries(): Promise<ReviewEntry[]> {
  try {
    const { reviews } = await import('../.velite/index.js')
    return reviews as ReviewEntry[]
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const states = await getAllStates()
  const blogPosts = await getBlogPosts()
  const reviewEntries = await getReviewEntries()

  const staticContentDate = new Date('2026-02-01')
  const launchDate = new Date('2026-02-11')

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}${getHomepageUrl()}`,
      lastModified: launchDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}${getAllStatesUrl()}`,
      lastModified: launchDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}${getAboutUrl()}`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}${getContactUrl()}`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}${getStoreSubmitUrl()}`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}${getFaqUrl()}`,
      lastModified: staticContentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}${getWhatIsScratchAndDentUrl()}`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}${getBuyersGuideUrl()}`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}${getBlogUrl()}`,
      lastModified: launchDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Blog post pages
  const publishedPosts = blogPosts.filter((post) => !post.draft)
  const blogPages: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${SITE_URL}${getBlogPostUrl(post.slug)}`,
    lastModified: new Date(post.updated),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Review pages
  const publishedReviews = reviewEntries.filter((r) => !r.draft)
  const reviewIndexPage: MetadataRoute.Sitemap = publishedReviews.length > 0
    ? [{
        url: `${SITE_URL}${getReviewsUrl()}`,
        lastModified: launchDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }]
    : []
  const reviewPages: MetadataRoute.Sitemap = publishedReviews.map((review) => ({
    url: `${SITE_URL}${getReviewUrl(review.slug)}`,
    lastModified: new Date(review.updated),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // State pages (only states with stores)
  const indexableStates = states.filter(shouldIndexState)
  const statePages: MetadataRoute.Sitemap = indexableStates.map((state) => ({
    url: `${SITE_URL}${getStateUrl(state)}`,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // City pages - only cities with stores (matches noindex logic in lib/seo.ts)
  const cityPages: MetadataRoute.Sitemap = []

  for (const state of indexableStates) {
    const cities = await getCitiesByStateId(state.id)

    for (const city of cities.filter(shouldIndexCity)) {
      cityPages.push({
        url: `${SITE_URL}${getCityUrl(state, city)}`,
        changeFrequency: 'daily',
        priority: 0.7,
      })
    }
  }

  // Deals pages (when feature flag is enabled)
  const dealsPages: MetadataRoute.Sitemap = ENABLE_DEALS
    ? [
        {
          url: `${SITE_URL}${getDealsUrl()}`,
          lastModified: launchDate,
          changeFrequency: 'daily' as const,
          priority: 0.8,
        },
        {
          url: `${SITE_URL}${getDealPostUrl()}`,
          lastModified: staticContentDate,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        },
      ]
    : []

  return [...staticPages, ...dealsPages, ...blogPages, ...reviewIndexPage, ...reviewPages, ...statePages, ...cityPages]
}
