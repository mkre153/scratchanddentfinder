/**
 * Submission Approval Source
 *
 * Handles store creation from approved submissions.
 * Called by admin approval flow.
 *
 * This module is responsible for:
 * - Creating stores from approved submissions
 * - Setting is_verified = true on created stores
 * - Logging the operation
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { StoreInsert, Store, StoreRow } from '@/lib/types'
import { ensureCity, logIngestion } from './index'
import { hashAddress, normalizePhone } from '@/lib/utils/address-normalizer'

// =============================================================================
// Row to Model Transformer
// =============================================================================

function storeRowToModel(row: StoreRow): Store {
  return {
    id: row.id,
    placeId: row.place_id,
    userId: row.user_id,
    name: row.name,
    slug: row.slug,
    address: row.address,
    cityId: row.city_id,
    stateId: row.state_id,
    zip: row.zip,
    phone: row.phone,
    website: row.website,
    description: row.description,
    hours: row.hours,
    appliances: row.appliances,
    services: row.services,
    rating: row.rating,
    reviewCount: row.review_count,
    isFeatured: row.is_featured,
    featuredTier: row.featured_tier,
    featuredUntil: row.featured_until,
    lat: row.lat,
    lng: row.lng,
    // Geolocation metadata (Phase 1: Data Integrity)
    geoSource: row.geo_source,
    geoPrecision: row.geo_precision,
    isApproved: row.is_approved,
    isVerified: row.is_verified,
    claimedBy: row.claimed_by,
    claimedAt: row.claimed_at,
  }
}

// =============================================================================
// Store Operations (Boundary-Internal)
// =============================================================================

/**
 * Upsert a store with is_verified = true
 * ALWAYS sets is_verified = true for data entering through ingestion boundary
 */
async function upsertVerifiedStore(store: StoreInsert): Promise<Store> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('stores')
    .upsert(
      {
        ...store,
        is_verified: true, // Ingestion boundary guarantees this
      },
      { onConflict: 'place_id' }
    )
    .select()
    .single()

  if (error) throw error
  return storeRowToModel(data as StoreRow)
}

// =============================================================================
// Main Ingestion Function
// =============================================================================

/**
 * Ingest a store from an approved submission
 *
 * This is the ONLY way to create a store from a submission.
 * The created store:
 * - Gets is_verified = true
 * - Gets is_approved = true
 * - Is logged to ingestion_log
 *
 * @param submissionId - The ID of the submission to approve
 * @param adminUserId - The admin user approving the submission
 * @returns The created Store
 * @throws Error if submission not found or store creation fails
 */
export async function ingestStoreFromSubmission(
  submissionId: string,
  adminUserId: string
): Promise<Store> {
  // 1. Get the submission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: submission, error: fetchError } = await (supabaseAdmin as any)
    .from('store_submissions')
    .select('*')
    .eq('id', submissionId)
    .eq('status', 'pending')
    .single()

  if (fetchError || !submission) {
    throw new Error(`Submission ${submissionId} not found or not pending`)
  }

  // 2. Look up the state by code (state field contains the 2-letter code)
  const { data: stateData, error: stateError } = await supabaseAdmin
    .from('states')
    .select('id, slug')
    .ilike('slug', submission.state)
    .single<{ id: number; slug: string }>()

  if (stateError || !stateData) {
    throw new Error(`State not found for code: ${submission.state}`)
  }

  // 3. Get or create the city through ingestion boundary
  const city = await ensureCity(
    stateData.id,
    submission.state,
    submission.city
  )

  // 4. Generate deterministic slug for the store
  const storeSlug = `${submission.business_name}-${submission.city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // 5. Generate address hash for deduplication
  const addressHash = hashAddress(submission.street_address)
  const phoneNormalized = normalizePhone(submission.phone)

  // 6. Check for existing store at this address (duplicate prevention)
  if (addressHash) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingStore } = await (supabaseAdmin as any)
      .from('stores')
      .select('id, name, slug')
      .eq('address_hash', addressHash)
      .or('is_archived.is.null,is_archived.eq.false')
      .single()

    if (existingStore) {
      throw new Error(
        `Duplicate detected: A store already exists at this address. ` +
        `Existing store: "${existingStore.name}" (ID: ${existingStore.id}). ` +
        `Consider claiming the existing listing instead.`
      )
    }
  }

  // 7. Generate a unique place_id for self-submitted stores
  const placeId = `submission_${submissionId}`

  // 8. Create the store record with is_verified = true
  const storeInsert: StoreInsert = {
    place_id: placeId,
    user_id: null,
    name: submission.business_name,
    slug: storeSlug,
    address: submission.street_address,
    city_id: city.id,
    state_id: stateData.id,
    zip: null,
    phone: submission.phone,
    website: submission.website,
    description: null,
    hours: null,
    appliances: null,
    services: null,
    rating: null,
    review_count: null,
    is_featured: false,
    featured_tier: null,
    featured_until: null,
    // Geolocation fields (Phase 1: Data Integrity)
    lat: submission.lat ?? null,
    lng: submission.lng ?? null,
    geo_source: submission.geo_source ?? null,
    geo_precision: submission.geo_precision ?? null,
    is_approved: true,
    claimed_by: null,
    claimed_at: null,
    // Deduplication fields
    address_hash: addressHash,
    phone_normalized: phoneNormalized,
  }

  const store = await upsertVerifiedStore(storeInsert)

  // 9. Mark submission as approved (only after store created successfully)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabaseAdmin as any)
    .from('store_submissions')
    .update({ status: 'approved' })
    .eq('id', submissionId)

  if (updateError) {
    // Store was created but submission update failed
    // Log this but don't throw - the store exists
    console.error('Failed to mark submission as approved:', updateError)
  }

  // 10. Log the ingestion operation
  await logIngestion(
    'submission_approved',
    `submission_${submissionId}`,
    1,
    adminUserId
  )

  return store
}
