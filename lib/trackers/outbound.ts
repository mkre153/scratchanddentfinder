/**
 * Outbound Event Tracker
 *
 * Slice 3: Parity-safe event sink
 * Slice 10: Now persists to cta_events table via API
 *
 * Uses adapter pattern - posts to internal API.
 */

import type { OutboundEvent } from '@/lib/events'

/**
 * Map OutboundEvent type to cta_events event_type
 */
function mapEventType(type: OutboundEvent['type']): 'call' | 'directions' | 'website' {
  if (type === 'phone') return 'call'
  return type
}

/**
 * Track outbound click events.
 * Called when users click phone, directions, or website CTAs.
 * Persists to cta_events table via API (fire-and-forget).
 */
export function trackOutboundEvent(event: OutboundEvent): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[outbound]',
      event.type,
      `store:${event.storeId}`,
      new Date(event.timestamp).toISOString()
    )
  }

  // Persist to cta_events table (fire-and-forget)
  const sourcePage = typeof window !== 'undefined' ? window.location.pathname : 'unknown'

  fetch('/api/cta-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storeId: event.storeId,
      eventType: mapEventType(event.type),
      sourcePage,
    }),
  }).catch(() => {
    // Silently fail - event tracking should not block user experience
  })
}
