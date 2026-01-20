/**
 * ZIP Code Geocoder
 *
 * Phase 2: Static ZIP → lat/lng lookup for geolocation fallback.
 * Uses bundled centroid data from US Census ZCTA.
 *
 * No external API calls — purely static lookup.
 */

// Type for the ZIP centroids data structure
type ZipCentroidData = Record<string, number[]>

// Import with explicit type
import zipCentroidsData from '@/data/zip-centroids.json'
const zipCentroids = zipCentroidsData as ZipCentroidData

export interface ZipCoordinates {
  lat: number
  lng: number
}

/**
 * Look up coordinates for a US ZIP code.
 *
 * @param zip - 5-digit ZIP code (e.g., "90210")
 * @returns Coordinates or null if not found
 */
export function getZipCoordinates(zip: string): ZipCoordinates | null {
  // Normalize to 5 digits (strip +4 if present)
  const zip5 = zip.replace(/[^0-9]/g, '').slice(0, 5)

  if (zip5.length !== 5) {
    return null
  }

  const coords = zipCentroids[zip5]

  if (!coords || coords.length < 2) {
    return null
  }

  return {
    lat: coords[0],
    lng: coords[1],
  }
}

/**
 * Validate ZIP code format.
 *
 * @param zip - ZIP code to validate
 * @returns true if valid 5-digit format
 */
export function isValidZip(zip: string): boolean {
  const zip5 = zip.replace(/[^0-9]/g, '').slice(0, 5)
  return zip5.length === 5
}
