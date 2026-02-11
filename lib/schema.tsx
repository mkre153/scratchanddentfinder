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
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}${getAllStatesUrl()}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
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

  if (store.hours) {
    const dayKeys: [string, string, string][] = [
      ['monday', 'mon', 'Monday'],
      ['tuesday', 'tue', 'Tuesday'],
      ['wednesday', 'wed', 'Wednesday'],
      ['thursday', 'thu', 'Thursday'],
      ['friday', 'fri', 'Friday'],
      ['saturday', 'sat', 'Saturday'],
      ['sunday', 'sun', 'Sunday'],
    ]
    const specs: { '@type': string; dayOfWeek: string; opens: string; closes: string }[] = []
    for (const [full, abbr, label] of dayKeys) {
      const val = store.hours[full] ?? store.hours[abbr]
      if (!val || val === 'closed') continue
      if (typeof val === 'object') {
        specs.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: label, opens: val.open, closes: val.close })
      } else if (typeof val === 'string') {
        const parts = val.split('-')
        if (parts.length === 2) {
          specs.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: label, opens: parts[0].trim(), closes: parts[1].trim() })
        }
      }
    }
    if (specs.length > 0) {
      schema.openingHoursSpecification = specs
    }
  }

  return schema
}

// =============================================================================
// ItemList Schema (City Page — wraps LocalBusiness entries)
// =============================================================================

/**
 * Generate ItemList schema wrapping LocalBusiness entries for a city page
 */
export function generateItemListSchema(
  stores: Store[],
  state: State,
  city: City
): object {
  const items = stores
    .filter(isStoreSchemaEligible)
    .map((store, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: generateLocalBusinessSchema(store, state, city),
    }))
    .filter((item) => item.item !== null)

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items,
  }
}

// =============================================================================
// FAQPage Schema
// =============================================================================

interface FAQItem {
  question: string
  answer: string
}

/**
 * Generate FAQPage schema for rich results
 *
 * Use on pages with FAQ content (e.g., /buyers-guide/)
 * Each Q&A pair becomes a Question/Answer entity
 */
export function generateFAQPageSchema(faqs: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// =============================================================================
// HowTo Schema
// =============================================================================

interface HowToStep {
  name: string
  text: string
}

/**
 * Generate HowTo schema for rich results
 *
 * Use on pages with step-by-step processes (e.g., homepage "How It Works")
 */
export function generateHowToSchema(
  name: string,
  description: string,
  steps: HowToStep[]
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }
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
