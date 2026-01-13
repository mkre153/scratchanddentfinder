/**
 * Event Type Definitions
 *
 * Slice 3: Tracked Outbound Actions
 * These types define the structure of events tracked when users
 * interact with store CTAs (phone, directions, website).
 */

export type OutboundEventType = 'phone' | 'directions' | 'website'

export interface OutboundEvent {
  type: OutboundEventType
  storeId: number
  source: 'store_card'
  timestamp: number
}
