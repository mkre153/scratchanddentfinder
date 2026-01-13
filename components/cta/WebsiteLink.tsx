'use client'

/**
 * WebsiteLink Component
 *
 * Tracked website CTA that logs outbound events.
 * Opens store website in new tab.
 * Uses adapter pattern - no direct HTTP calls.
 */

import { trackOutboundEvent } from '@/lib/trackers/outbound'

interface WebsiteLinkProps {
  storeId: number
  url: string
  className?: string
}

export function WebsiteLink({ storeId, url, className }: WebsiteLinkProps) {
  const handleClick = () => {
    trackOutboundEvent({
      type: 'website',
      storeId,
      source: 'store_card',
      timestamp: Date.now(),
    })
  }

  return (
    <a
      href={url}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-testid="website-cta"
    >
      Visit Website
    </a>
  )
}
