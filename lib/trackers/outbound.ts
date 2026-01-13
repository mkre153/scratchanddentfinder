/**
 * Outbound Event Tracker
 *
 * Slice 3: Parity-safe event sink
 * Currently logs to console in development.
 * Future: Adapter to analytics/DB persistence.
 *
 * Uses adapter pattern - no direct HTTP calls.
 */

import type { OutboundEvent } from '@/lib/events'

/**
 * Track outbound click events.
 * Called when users click phone, directions, or website CTAs.
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
  // Future: send to analytics adapter
}
