'use client'

/**
 * DirectionsLink Component
 *
 * Tracked directions CTA that logs outbound events.
 * Opens Google Maps with encoded address.
 * Uses adapter pattern - no direct HTTP calls.
 */

import { trackOutboundEvent } from '@/lib/trackers/outbound'

interface DirectionsLinkProps {
  storeId: number
  address: string
  className?: string
}

export function DirectionsLink({ storeId, address, className }: DirectionsLinkProps) {
  const handleClick = () => {
    trackOutboundEvent({
      type: 'directions',
      storeId,
      source: 'store_card',
      timestamp: Date.now(),
    })
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`

  return (
    <a
      href={mapsUrl}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-testid="directions-cta"
    >
      Get Directions
    </a>
  )
}
