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
} from '@/lib/urls'
import { getAllStates, getCitiesByStateId } from '@/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const states = await getAllStates()

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
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}${getContactUrl()}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}${getAdvertiseUrl()}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}${getStoreSubmitUrl()}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // State pages
  const statePages: MetadataRoute.Sitemap = states.map((state) => ({
    url: `${SITE_URL}${getStateUrl(state)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // City pages - fetch all cities for each state
  const cityPages: MetadataRoute.Sitemap = []

  for (const state of states) {
    const cities = await getCitiesByStateId(state.id)

    for (const city of cities) {
      cityPages.push({
        url: `${SITE_URL}${getCityUrl(state, city)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      })
    }
  }

  return [...staticPages, ...statePages, ...cityPages]
}
