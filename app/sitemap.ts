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
  getAdvertiseUrl,
  getStoreSubmitUrl,
  getBuyersGuideUrl,
  getFaqUrl,
  getWhatIsScratchAndDentUrl,
} from '@/lib/urls'
import { shouldIndexState, shouldIndexCity } from '@/lib/seo'
import { getAllStates, getCitiesByStateId } from '@/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const states = await getAllStates()

  const staticContentDate = new Date('2026-02-01')

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}${getHomepageUrl()}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}${getAllStatesUrl()}`,
      lastModified: new Date(),
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
      url: `${SITE_URL}${getAdvertiseUrl()}`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
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
  ]

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

  return [...staticPages, ...statePages, ...cityPages]
}
