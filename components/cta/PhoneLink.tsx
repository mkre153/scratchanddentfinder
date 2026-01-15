'use client'

/**
 * PhoneLink Component
 *
 * Tracked phone CTA that logs outbound events.
 * Uses adapter pattern - no direct HTTP calls.
 */

import { trackOutboundEvent } from '@/lib/trackers/outbound'
import { formatPhoneNumber } from '@/lib/format'

interface PhoneLinkProps {
  storeId: number
  phone: string
  className?: string
}

export function PhoneLink({ storeId, phone, className }: PhoneLinkProps) {
  const handleClick = () => {
    trackOutboundEvent({
      type: 'phone',
      storeId,
      source: 'store_card',
      timestamp: Date.now(),
    })
  }

  return (
    <a
      href={`tel:${phone}`}
      onClick={handleClick}
      className={className}
      data-testid="phone-cta"
    >
      {formatPhoneNumber(phone)}
    </a>
  )
}
