/**
 * Application Configuration
 *
 * Central configuration for the application.
 * PARITY_MODE controls exact replication behavior.
 */

/**
 * PARITY_MODE: When true, enforces exact behavioral parity with scratchanddentfinder.com
 *
 * Effects:
 * - No forms on directory pages (/, /scratch-and-dent-appliances/**, city pages)
 * - Only tracked CTAs (call, directions, website)
 * - Absolute canonicals only
 * - Exactly 12 nearby cities
 */
export const PARITY_MODE = true

/**
 * Site URL for canonical URLs and absolute links
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://scratchanddentfinder.com'

/**
 * Site name for metadata
 */
export const SITE_NAME = 'Scratch & Dent Finder'

/**
 * Default meta description
 */
export const DEFAULT_DESCRIPTION =
  'Find scratch and dent appliance stores near you. Save 30-70% on quality appliances with minor cosmetic damage.'

// =============================================================================
// FEATURE FLAGS
// =============================================================================

/**
 * ENABLE_QUICK_ASSESS_WIDGET: Show QuickAssessWidget on State/City directory pages
 *
 * Set via environment variable: NEXT_PUBLIC_ENABLE_QUICK_ASSESS_WIDGET=true
 *
 * Default: false (disabled)
 * Scope: State and City pages only (/buyers-guide remains always-on)
 *
 * Rollout strategy:
 * 1. Deploy with flag disabled
 * 2. Enable in staging/preview
 * 3. Enable in production after validation
 * 4. Remove flag once stable
 */
export const ENABLE_QUICK_ASSESS_WIDGET =
  process.env.NEXT_PUBLIC_ENABLE_QUICK_ASSESS_WIDGET === 'true'

/**
 * ENABLE_CITY_ENRICHMENT: Show CityFAQ and CityBuyingGuide on city pages
 *
 * Set via environment variable: NEXT_PUBLIC_ENABLE_CITY_ENRICHMENT=true
 *
 * Default: false (disabled)
 * Scope: City pages only
 */
export const ENABLE_CITY_ENRICHMENT =
  process.env.NEXT_PUBLIC_ENABLE_CITY_ENRICHMENT === 'true'
