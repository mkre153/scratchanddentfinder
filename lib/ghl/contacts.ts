/**
 * GoHighLevel Contact Operations
 *
 * Functions for creating and updating contacts in GHL.
 * Uses the upsert endpoint to prevent duplicates.
 */

import { ghlFetchWithRetry, getLocationId, isGHLConfigured } from './client'
import type {
  GHLContactInput,
  GHLContactResponse,
  GHLResult,
  GHLUpsertContactRequest,
} from './types'

/**
 * Create or update a contact in GoHighLevel
 *
 * Uses the upsert endpoint - if email exists, updates; otherwise creates.
 * This function will NOT throw errors - it returns a result object.
 * This ensures GHL sync never blocks the main user flow.
 *
 * @param input - Contact data to sync
 * @returns Result object with success/failure status
 */
export async function createOrUpdateContact(
  input: GHLContactInput
): Promise<GHLResult<{ contactId: string }>> {
  // Skip if GHL is not configured
  if (!isGHLConfigured()) {
    console.log('[GHL] Not configured, skipping contact sync')
    return { success: false, error: 'GHL not configured' }
  }

  try {
    const locationId = getLocationId()

    // Build the request body
    const requestBody: GHLUpsertContactRequest = {
      locationId,
      email: input.email,
    }

    // Add optional fields if provided
    if (input.phone) requestBody.phone = input.phone
    if (input.firstName) requestBody.firstName = input.firstName
    if (input.lastName) requestBody.lastName = input.lastName
    if (input.name) requestBody.name = input.name
    if (input.tags && input.tags.length > 0) requestBody.tags = input.tags
    if (input.source) requestBody.source = input.source
    if (input.customFields && input.customFields.length > 0) {
      requestBody.customFields = input.customFields
    }

    const response = await ghlFetchWithRetry<GHLContactResponse>(
      '/contacts/upsert',
      {
        method: 'POST',
        body: requestBody as unknown as Record<string, unknown>,
      }
    )

    const contactId = response.contact?.id
    if (contactId) {
      console.log('[GHL] Contact synced successfully:', contactId)
      return { success: true, data: { contactId } }
    }

    return { success: false, error: 'No contact ID in response' }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[GHL] Failed to sync contact:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Phase 1: Sync new store submission to GHL (on form submit)
 *
 * Creates contact immediately with pending-verification tags.
 * Enables assistive workflows (email reminders, soft nudges).
 *
 * Tags: store-submission, pending-verification, unverified
 */
export async function syncNewSubmission(submission: {
  email: string
  phone?: string
  businessName: string
  city: string
  state: string
}): Promise<GHLResult<{ contactId: string }>> {
  return createOrUpdateContact({
    email: submission.email,
    phone: submission.phone,
    name: submission.businessName,
    tags: ['store-submission', 'pending-verification', 'unverified'],
    source: 'Add Your Store',
    customFields: [
      { key: 'business_name', field_value: submission.businessName },
      { key: 'city', field_value: submission.city },
      { key: 'state', field_value: submission.state },
    ],
  })
}

/**
 * Phase 2: Update contact after email verification
 *
 * Removes pending-verification/unverified tags, adds verified/ready-for-review/confirmation-sent.
 * Enables sales-qualified workflows.
 *
 * Tags: store-submission, verified, ready-for-review, confirmation-sent
 * Removes: pending-verification, unverified
 */
export async function updateSubmissionVerified(
  email: string
): Promise<GHLResult<{ contactId: string }>> {
  return createOrUpdateContact({
    email: email,
    tags: ['store-submission', 'verified', 'ready-for-review', 'confirmation-sent'],
    // Upsert replaces tags on existing contact (keyed by email)
  })
}

/**
 * @deprecated Use syncNewSubmission() + updateSubmissionVerified() for two-phase lifecycle
 */
export async function syncStoreSubmission(submission: {
  email: string
  phone?: string
  businessName: string
  city: string
  state: string
}): Promise<GHLResult<{ contactId: string }>> {
  return syncNewSubmission(submission)
}

/**
 * Sync an ownership claim to GHL
 *
 * Convenience function with preset tags for ownership claims.
 */
export async function syncOwnershipClaim(claim: {
  email: string
  phone?: string
  name: string
  storeName: string
  relationship: string
}): Promise<GHLResult<{ contactId: string }>> {
  return createOrUpdateContact({
    email: claim.email,
    phone: claim.phone,
    name: claim.name,
    tags: ['ownership-claim', 'high-intent'],
    source: 'Store Ownership Claim',
    customFields: [
      { key: 'store_name', field_value: claim.storeName },
      { key: 'relationship', field_value: claim.relationship },
    ],
  })
}

/**
 * Sync a Stripe purchase to GHL
 *
 * Convenience function for updating contact after payment.
 */
export async function syncStripePurchase(purchase: {
  email: string
  tier: 'monthly' | 'annual'
}): Promise<GHLResult<{ contactId: string }>> {
  return createOrUpdateContact({
    email: purchase.email,
    tags: ['paying-customer', purchase.tier],
    source: 'Stripe Checkout',
    customFields: [
      { key: 'subscription_tier', field_value: purchase.tier },
      { key: 'subscription_status', field_value: 'active' },
    ],
  })
}
