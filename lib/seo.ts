/**
 * SEO Utilities
 *
 * Metadata generation and indexing logic.
 * Gate 3 enforces absolute canonicals with trailing slash.
 */

import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from './config'
import {
  getHomepageUrl,
  getAllStatesUrl,
  getStateUrl,
  getCityUrl,
  getAboutUrl,
  getContactUrl,
  getAdvertiseUrl,
} from './urls'
import type { State, City } from './types'

// =============================================================================
// Canonical URL Generation
// =============================================================================

/**
 * Generate absolute canonical URL
 * Gate 3: All canonicals must be absolute with trailing slash
 */
export function getCanonicalUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  // Ensure trailing slash
  const withTrailingSlash = normalizedPath.endsWith('/')
    ? normalizedPath
    : `${normalizedPath}/`
  return `${SITE_URL}${withTrailingSlash}`
}

// =============================================================================
// Indexing Rules
// =============================================================================

/**
 * Should a state page be indexed?
 * Only index states with stores
 */
export function shouldIndexState(state: { storeCount: number }): boolean {
  return state.storeCount > 0
}

/**
 * Should a city page be indexed?
 * Only index cities with stores
 */
export function shouldIndexCity(city: { storeCount: number }): boolean {
  return city.storeCount > 0
}

// =============================================================================
// Metadata Generation
// =============================================================================

/**
 * Generate metadata for homepage
 */
export function generateHomepageMetadata(): Metadata {
  return {
    title: `${SITE_NAME} | Find Scratch and Dent Appliance Stores`,
    description: DEFAULT_DESCRIPTION,
    alternates: {
      canonical: getCanonicalUrl(getHomepageUrl()),
    },
  }
}

/**
 * Generate metadata for all states page
 */
export function generateAllStatesMetadata(): Metadata {
  return {
    title: `Scratch and Dent Appliances by State | ${SITE_NAME}`,
    description:
      'Browse scratch and dent appliance stores in all 50 states. Find discount appliances near you and save 30-70%.',
    alternates: {
      canonical: getCanonicalUrl(getAllStatesUrl()),
    },
  }
}

/**
 * Generate metadata for state page
 */
export function generateStateMetadata(state: State): Metadata {
  const title = `Scratch and Dent Appliances in ${state.name} | ${SITE_NAME}`
  const description = `Find ${state.storeCount} scratch and dent appliance stores in ${state.name}. Browse ${state.cityCount} cities and save 30-70% on quality appliances.`

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(getStateUrl(state)),
    },
    robots: shouldIndexState(state) ? undefined : { index: false },
  }
}

/**
 * Generate metadata for city page
 */
export function generateCityMetadata(
  city: City,
  state: State
): Metadata {
  const title = `Scratch and Dent Appliances in ${city.name}, ${state.name} | ${SITE_NAME}`
  const description = `Find ${city.storeCount} scratch and dent appliance stores in ${city.name}, ${state.name}. Save 30-70% on refrigerators, washers, dryers, and more.`

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(getCityUrl(state, city)),
    },
    robots: shouldIndexCity(city) ? undefined : { index: false },
  }
}

// =============================================================================
// Marketing Page Metadata (Slice 7)
// =============================================================================

/**
 * Generate metadata for about page
 */
export function generateAboutMetadata(): Metadata {
  return {
    title: `About Us | ${SITE_NAME}`,
    description:
      'Learn about Scratch & Dent Locator - helping families find affordable appliances with minor cosmetic damage at 30-70% off retail prices.',
    alternates: {
      canonical: getCanonicalUrl(getAboutUrl()),
    },
  }
}

/**
 * Generate metadata for contact page
 */
export function generateContactMetadata(): Metadata {
  return {
    title: `Contact Us | ${SITE_NAME}`,
    description:
      'Get in touch with Scratch & Dent Locator. Questions about our directory, store submissions, or business inquiries.',
    alternates: {
      canonical: getCanonicalUrl(getContactUrl()),
    },
  }
}

/**
 * Generate metadata for advertise page
 */
export function generateAdvertiseMetadata(): Metadata {
  return {
    title: `Advertise With Us | ${SITE_NAME}`,
    description:
      'Promote your appliance store on Scratch & Dent Locator. Featured listings get top placement and increased visibility.',
    alternates: {
      canonical: getCanonicalUrl(getAdvertiseUrl()),
    },
  }
}

/**
 * Generate generic page metadata
 */
export function generatePageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
    },
  }
}
