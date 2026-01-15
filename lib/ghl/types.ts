/**
 * GoHighLevel API Types
 *
 * TypeScript interfaces for GHL API requests and responses.
 */

/**
 * Contact data for creating/updating in GHL
 */
export interface GHLContactInput {
  email: string
  phone?: string
  firstName?: string
  lastName?: string
  name?: string
  tags?: string[]
  source?: string
  customFields?: GHLCustomField[]
}

/**
 * Custom field for GHL contact
 */
export interface GHLCustomField {
  key: string
  field_value: string
}

/**
 * GHL API request body for upsert contact
 */
export interface GHLUpsertContactRequest {
  locationId: string
  email: string
  phone?: string
  firstName?: string
  lastName?: string
  name?: string
  tags?: string[]
  source?: string
  customFields?: GHLCustomField[]
}

/**
 * GHL API response for contact operations
 */
export interface GHLContactResponse {
  contact: {
    id: string
    locationId: string
    email: string
    phone?: string
    firstName?: string
    lastName?: string
    name?: string
    tags?: string[]
    source?: string
  }
}

/**
 * GHL API error response
 */
export interface GHLErrorResponse {
  message: string
  statusCode: number
  error?: string
}

/**
 * Result type for GHL operations
 */
export type GHLResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
