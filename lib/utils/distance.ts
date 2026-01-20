/**
 * Distance Calculation Utility
 *
 * THE single source of truth for all distance calculations.
 * Uses Haversine formula for accurate great-circle distances.
 *
 * Phase 4: All distance calculations MUST use this utility.
 * No inline Math.pow/Math.sqrt distance calculations elsewhere.
 */

/**
 * Calculate great-circle distance between two points using Haversine formula.
 *
 * @param lat1 - Latitude of point 1
 * @param lng1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lng2 - Longitude of point 2
 * @returns Distance in miles
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate bounding box for a given center point and radius.
 * Used for efficient database pre-filtering before exact distance calculation.
 *
 * @param lat - Center latitude
 * @param lng - Center longitude
 * @param radiusMiles - Radius in miles
 * @returns Bounding box with min/max lat/lng
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusMiles: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  // Approximate degrees per mile
  // Latitude: ~69 miles per degree (constant)
  // Longitude: varies by latitude (69 * cos(lat))
  const latDelta = radiusMiles / 69
  const lngDelta = radiusMiles / (69 * Math.cos(toRadians(lat)))

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  }
}
