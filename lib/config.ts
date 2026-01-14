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
