/**
 * SEO Utilities
 *
 * Metadata generation and indexing logic.
 * Gate 3 enforces absolute canonicals with trailing slash.
 *
 * Slice 12: Added Open Graph and Twitter Card metadata.
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
// Open Graph / Twitter Constants
// =============================================================================

// Next.js auto-generates from app/opengraph-image.tsx
const OG_IMAGE_PATH = '/opengraph-image'
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630

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
// Open Graph / Twitter Helpers
// =============================================================================

/**
 * Generate Open Graph metadata
 */
function generateOpenGraph(params: {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
}): Metadata['openGraph'] {
  return {
    title: params.title,
    description: params.description,
    url: getCanonicalUrl(params.path),
    siteName: SITE_NAME,
    type: params.type || 'website',
    images: [
      {
        url: `${SITE_URL}${OG_IMAGE_PATH}`,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: params.title,
      },
    ],
  }
}

/**
 * Generate Twitter Card metadata
 */
function generateTwitter(params: {
  title: string
  description: string
}): Metadata['twitter'] {
  return {
    card: 'summary_large_image',
    title: params.title,
    description: params.description,
    images: [`${SITE_URL}${OG_IMAGE_PATH}`],
  }
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
  const title = `${SITE_NAME} | Find Scratch and Dent Appliance Stores`
  const description = DEFAULT_DESCRIPTION
  const path = getHomepageUrl()

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
    },
    openGraph: generateOpenGraph({ title, description, path }),
    twitter: generateTwitter({ title, description }),
  }
}

/**
 * Generate metadata for all states page
 */
export function generateAllStatesMetadata(): Metadata {
  const title = `Scratch and Dent Appliances by State | ${SITE_NAME}`
  const description =
    'Browse scratch and dent appliance stores in all 50 states. Find discount appliances near you and save 30-70%.'
  const path = getAllStatesUrl()

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
    },
    openGraph: generateOpenGraph({ title, description, path }),
    twitter: generateTwitter({ title, description }),
  }
}

/**
 * Generate metadata for state page
 */
export function generateStateMetadata(state: State): Metadata {
  const title = `Scratch and Dent Appliances in ${state.name} | ${SITE_NAME}`
  const description = `Find ${state.storeCount} scratch and dent appliance stores in ${state.name}. Browse ${state.cityCount} cities and save 30-70% on quality appliances.`
  const path = getStateUrl(state)

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
    },
    robots: shouldIndexState(state) ? undefined : { index: false },
    openGraph: generateOpenGraph({ title, description, path }),
    twitter: generateTwitter({ title, description }),
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
  const path = getCityUrl(state, city)

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
    },
    robots: shouldIndexCity(city) ? undefined : { index: false },
    openGraph: generateOpenGraph({ title, description, path }),
    twitter: generateTwitter({ title, description }),
  }
}

// =============================================================================
// Marketing Page Metadata (Slice 7)
// =============================================================================

/**
 * Generate metadata for about page
 */
export function generateAboutMetadata(): Metadata {
  const title = `About Us | ${SITE_NAME}`
  const description =
    'Learn about Scratch & Dent Finder - helping families find affordable appliances with minor cosmetic damage at 30-70% off retail prices.'
  const path = getAboutUrl()

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
    },
    openGraph: generateOpenGraph({ title, description, path }),
    twitter: generateTwitter({ title, description }),
  }
}

/**
 * Generate metadata for contact page
 */
export function generateContactMetadata(): Metadata {
  const title = `Contact Us | ${SITE_NAME}`
  const description =
    'Get in touch with Scratch & Dent Finder. Questions about our directory, store submissions, or business inquiries.'
  const path = getContactUrl()

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
    },
    openGraph: generateOpenGraph({ title, description, path }),
    twitter: generateTwitter({ title, description }),
  }
}

/**
 * Generate metadata for advertise page
 */
export function generateAdvertiseMetadata(): Metadata {
  const title = `Advertise With Us | ${SITE_NAME}`
  const description =
    'Promote your appliance store on Scratch & Dent Finder. Featured listings get top placement and increased visibility.'
  const path = getAdvertiseUrl()

  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
    },
    openGraph: generateOpenGraph({ title, description, path }),
    twitter: generateTwitter({ title, description }),
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
  const fullTitle = `${title} | ${SITE_NAME}`

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
    },
    openGraph: generateOpenGraph({ title: fullTitle, description, path }),
    twitter: generateTwitter({ title: fullTitle, description }),
  }
}
