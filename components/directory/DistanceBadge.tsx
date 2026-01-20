'use client'

/**
 * DistanceBadge Component
 *
 * Phase 3: Shows "X mi away" when user location is known.
 * Only renders when both user location and store coordinates exist.
 */

import { useUserLocation } from '@/lib/contexts/UserLocationContext'
import { haversineDistance } from '@/lib/utils/distance'

interface DistanceBadgeProps {
  storeLat: number | null
  storeLng: number | null
  className?: string
}

export function DistanceBadge({ storeLat, storeLng, className = '' }: DistanceBadgeProps) {
  const location = useUserLocation()

  // Don't render if no user location or store coordinates
  if (!location?.coords || storeLat == null || storeLng == null) {
    return null
  }

  const distance = haversineDistance(
    location.coords.lat,
    location.coords.lng,
    storeLat,
    storeLng
  )

  return (
    <span className={`text-sm text-gray-500 ${className}`}>
      {distance.toFixed(1)} mi away
    </span>
  )
}
