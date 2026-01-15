/**
 * GoHighLevel Integration Module
 *
 * Exports all GHL functionality for use throughout the application.
 */

export {
  createOrUpdateContact,
  syncStoreSubmission,
  syncOwnershipClaim,
  syncStripePurchase,
} from './contacts'

export { isGHLConfigured, ghlFetch, ghlFetchWithRetry } from './client'

export type {
  GHLContactInput,
  GHLContactResponse,
  GHLResult,
  GHLCustomField,
} from './types'
