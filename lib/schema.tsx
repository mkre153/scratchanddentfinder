/**
 * JSON-LD Schema Generation
 *
 * Structured data for rich search results.
 * Slice 12: Presentation Parity
 *
 * GUARDRAILS:
 * 1. Deterministic injection - One <script> per schema, fixed order:
 *    Organization → WebSite → BreadcrumbList → LocalBusiness
 * 2. LocalBusiness completeness - Only emit when ALL conditions met:
 *    - store.isApproved === true
 *    - store.address exists AND store.lat/lng exist (geo)
 *    - store.phone OR store.website exists
 *
 * All URLs must come from lib/urls.ts (Gate 5).
 */

import { SITE_URL, SITE_NAME } from './config'
import {
  getHomepageUrl,
  getAllStatesUrl,
  getStateUrl,
  getCityUrl,
} from './urls'
import type { State, City, Store } from './types'

// =============================================================================
// Organization Schema (Site-wide)
// =============================================================================

export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: `${SITE_URL}${getHomepageUrl()}`,
    // Uses auto-generated icon from app/icon.tsx
    logo: `${SITE_URL}/icon`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@scratchanddentfinder.com',
      contactType: 'customer service',
    },
  }
}

// =============================================================================
// WebSite Schema (Site-wide)
// =============================================================================

export function generateWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}${getHomepageUrl()}`,
    // Note: SearchAction omitted - site does not have search functionality
  }
}

// =============================================================================
// Breadcrumb Schema
// =============================================================================

interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
}

/**
 * Generate breadcrumbs for all states page
 */
export function generateAllStatesBreadcrumbs(): object {
  return generateBreadcrumbSchema([
    { name: 'Home', url: getHomepageUrl() },
    { name: 'All States', url: getAllStatesUrl() },
  ])
}

/**
 * Generate breadcrumbs for state page
 */
export function generateStateBreadcrumbs(state: State): object {
  return generateBreadcrumbSchema([
    { name: 'Home', url: getHomepageUrl() },
    { name: 'All States', url: getAllStatesUrl() },
    { name: state.name, url: getStateUrl(state) },
  ])
}

/**
 * Generate breadcrumbs for city page
 */
export function generateCityBreadcrumbs(state: State, city: City): object {
  return generateBreadcrumbSchema([
    { name: 'Home', url: getHomepageUrl() },
    { name: 'All States', url: getAllStatesUrl() },
    { name: state.name, url: getStateUrl(state) },
    { name: city.name, url: getCityUrl(state, city) },
  ])
}

// =============================================================================
// LocalBusiness Schema (Per Store)
// =============================================================================

/**
 * Check if store meets all requirements for LocalBusiness schema
 *
 * GUARDRAIL 2: Only emit when ALL conditions are true:
 * - store.isApproved === true
 * - store.address exists AND store.lat/lng exist (geo)
 * - store.phone OR store.website exists
 */
export function isStoreSchemaEligible(store: Store): boolean {
  // Must be approved
  if (!store.isApproved) return false

  // Must have address and geo coordinates
  if (!store.address || store.lat === null || store.lng === null) return false

  // Must have phone or website
  if (!store.phone && !store.website) return false

  return true
}

/**
 * Generate LocalBusiness schema for a store
 *
 * Only call this if isStoreSchemaEligible() returns true.
 * Returns null if store doesn't meet eligibility requirements.
 */
export function generateLocalBusinessSchema(
  store: Store,
  state: State,
  city: City
): object | null {
  // Enforce guardrail - return null if not eligible
  if (!isStoreSchemaEligible(store)) {
    return null
  }

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: city.name,
      addressRegion: state.name,
      postalCode: store.zip || undefined,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: store.lat,
      longitude: store.lng,
    },
  }

  // Add optional fields
  if (store.phone) {
    schema.telephone = store.phone
  }

  if (store.website) {
    schema.url = store.website
  }

  if (store.rating && store.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: store.rating,
      reviewCount: store.reviewCount,
    }
  }

  return schema
}

// =============================================================================
// JsonLd Component
// =============================================================================

/**
 * Render JSON-LD script tag for a single schema object
 *
 * GUARDRAIL 1: One <script> per schema object.
 * Render order should follow: Organization → WebSite → BreadcrumbList → LocalBusiness
 */
export function JsonLd({ data }: { data: object }): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * Render multiple JSON-LD scripts in deterministic order
 *
 * Each schema gets its own <script> tag (not bundled into array).
 * This ensures stable diffs and avoids Rich Results ambiguity.
 */
export function JsonLdMultiple({
  schemas,
}: {
  schemas: (object | null)[]
}): React.ReactElement {
  // Filter out null schemas (stores that didn't meet eligibility)
  const validSchemas = schemas.filter((s): s is object => s !== null)

  return (
    <>
      {validSchemas.map((schema, index) => (
        <JsonLd key={index} data={schema} />
      ))}
    </>
  )
}
