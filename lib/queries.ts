/**
 * Data Access Layer
 *
 * All database queries go through this file.
 * Components and pages MUST NOT import from lib/supabase directly.
 *
 * Gate 7 enforces the factory boundary.
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import type {
  State,
  StateRow,
  City,
  CityRow,
  Store,
  StoreRow,
  LeadInsert,
  ContactSubmissionInsert,
  StoreSubmissionInsert,
  StoreSubmission,
  StoreSubmissionRow,
  CtaEventInsert,
  StoreClaimInsert,
  StoreClaim,
  StoreClaimRow,
  AdminUserRow,
} from '@/lib/types'

// =============================================================================
// Row to Model Transformers
// =============================================================================

function stateRowToModel(row: StateRow): State {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    emoji: row.emoji,
    gradientColor: row.gradient_color,
    storeCount: row.store_count,
    cityCount: row.city_count,
  }
}

function cityRowToModel(row: CityRow): City {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    stateId: row.state_id,
    stateCode: row.state_code,
    lat: row.lat,
    lng: row.lng,
    storeCount: row.store_count,
  }
}

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
    isApproved: row.is_approved,
    isVerified: row.is_verified,
    claimedBy: row.claimed_by,
    claimedAt: row.claimed_at,
  }
}

// =============================================================================
// State Queries
// =============================================================================

/**
 * Get all states ordered alphabetically (Gate 10: deterministic ordering)
 */
export async function getAllStates(): Promise<State[]> {
  const { data, error } = await supabaseAdmin
    .from('states')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []).map(stateRowToModel)
}

/**
 * Get a state by slug
 */
export async function getStateBySlug(slug: string): Promise<State | null> {
  const { data, error } = await supabaseAdmin
    .from('states')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return stateRowToModel(data)
}

// =============================================================================
// City Queries
// =============================================================================

/**
 * Get cities for a state, ordered by store_count DESC, name ASC (Gate 10)
 */
export async function getCitiesByStateId(stateId: number): Promise<City[]> {
  const { data, error } = await supabaseAdmin
    .from('cities')
    .select('*')
    .eq('state_id', stateId)
    .order('store_count', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []).map(cityRowToModel)
}

/**
 * Get a city by slug and state (accepts state slug or state ID)
 */
export async function getCityBySlug(
  stateSlugOrId: string | number,
  citySlug: string
): Promise<City | null> {
  // Build query based on whether we got a state slug or ID
  let query = supabaseAdmin
    .from('cities')
    .select('*, states!inner(slug)')
    .eq('slug', citySlug)

  if (typeof stateSlugOrId === 'number') {
    query = query.eq('state_id', stateSlugOrId)
  } else {
    // Join with states table to match by state slug
    query = query.eq('states.slug', stateSlugOrId.toLowerCase())
  }

  const { data, error } = await query.single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return cityRowToModel(data)
}

/**
 * Get a city by name and state ID
 */
export async function getCityByNameAndState(
  cityName: string,
  stateId: number
): Promise<City | null> {
  const { data, error } = await supabaseAdmin
    .from('cities')
    .select('*')
    .eq('state_id', stateId)
    .ilike('name', cityName)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return cityRowToModel(data)
}

// NOTE: City creation functions (createCity, getOrCreateCity) have been moved to
// lib/ingestion/index.ts to enforce the ingestion boundary (Gate 16).
// All city creation must go through the ingestion boundary.

/**
 * Get nearby cities (Gate 4: exactly 12, Gate 10: deterministic ordering)
 */
export async function getNearbyCities(
  city: City,
  limit: number = 12
): Promise<City[]> {
  const { data, error } = await supabaseAdmin
    .from('cities')
    .select('*')
    .eq('state_code', city.stateCode)
    .neq('id', city.id)

  if (error) throw error
  if (!data) return []

  const rows = data as CityRow[]
  const hasCoords = city.lat != null && city.lng != null

  if (hasCoords) {
    const cityLat = city.lat as number
    const cityLng = city.lng as number

    // Sort by distance ASC, store_count DESC, name ASC (Gate 10)
    return rows
      .map((c) => ({
        ...c,
        distance:
          c.lat != null && c.lng != null
            ? Math.pow(cityLat - c.lat, 2) + Math.pow(cityLng - c.lng, 2)
            : Infinity,
      }))
      .sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance
        if (a.store_count !== b.store_count) return b.store_count - a.store_count
        return a.name.localeCompare(b.name)
      })
      .slice(0, limit)
      .map(cityRowToModel)
  }

  // Fallback: store_count DESC, name ASC
  return rows
    .sort((a, b) => {
      if (a.store_count !== b.store_count) return b.store_count - a.store_count
      return a.name.localeCompare(b.name)
    })
    .slice(0, limit)
    .map(cityRowToModel)
}

// =============================================================================
// Store Queries
// =============================================================================

/**
 * Get stores for a city, ordered by effective featured status DESC, name ASC (Gate 10)
 *
 * FEATURED STATUS LOGIC:
 * A store is "effectively featured" when BOTH conditions are met:
 * 1. is_featured = true (admin quality gate)
 * 2. featured_until > NOW() (has active paid tier)
 *
 * This prevents expired tiers from showing as featured, and ensures
 * paying customers without admin approval don't auto-get top placement.
 */
export async function getStoresByCityId(cityId: number): Promise<Store[]> {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_approved', true)
    .or('is_archived.is.null,is_archived.eq.false')

  if (error) throw error

  const stores = (data ?? []).map(storeRowToModel)
  const now = new Date()

  // Sort by effective featured status, then by name
  return stores.sort((a, b) => {
    const aEffectiveFeatured = a.isFeatured && a.featuredUntil && new Date(a.featuredUntil) > now
    const bEffectiveFeatured = b.isFeatured && b.featuredUntil && new Date(b.featuredUntil) > now

    // Featured stores first
    if (aEffectiveFeatured && !bEffectiveFeatured) return -1
    if (!aEffectiveFeatured && bEffectiveFeatured) return 1

    // Then by name
    return a.name.localeCompare(b.name)
  })
}

/**
 * Get stores for a state, ordered by effective featured status DESC, name ASC (Gate 10)
 *
 * Used on state pages per UX template requirements.
 * Same featured logic as getStoresByCityId.
 */
export async function getStoresByStateId(stateId: number): Promise<Store[]> {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('state_id', stateId)
    .eq('is_approved', true)
    .or('is_archived.is.null,is_archived.eq.false')

  if (error) throw error

  const stores = (data ?? []).map(storeRowToModel)
  const now = new Date()

  // Sort by effective featured status, then by name
  return stores.sort((a, b) => {
    const aEffectiveFeatured = a.isFeatured && a.featuredUntil && new Date(a.featuredUntil) > now
    const bEffectiveFeatured = b.isFeatured && b.featuredUntil && new Date(b.featuredUntil) > now

    // Featured stores first
    if (aEffectiveFeatured && !bEffectiveFeatured) return -1
    if (!aEffectiveFeatured && bEffectiveFeatured) return 1

    // Then by name
    return a.name.localeCompare(b.name)
  })
}

/**
 * Get a store by slug
 *
 * Also handles redirects: if the slug was from a merged/archived store,
 * returns the canonical store with _redirectedFrom metadata.
 */
export async function getStoreBySlug(slug: string): Promise<Store | null> {
  // First, check if this is a redirect from a merged store
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: redirect } = await (supabaseAdmin as any)
    .from('store_slug_redirects')
    .select('canonical_store_id')
    .eq('old_slug', slug)
    .single() as { data: { canonical_store_id: number } | null }

  if (redirect) {
    // Fetch the canonical store and mark it as a redirect
    const canonical = await getStoreById(redirect.canonical_store_id)
    if (canonical) {
      return {
        ...canonical,
        _redirectedFrom: slug,
      } as Store
    }
  }

  // Normal lookup - filter out archived stores
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .or('is_archived.is.null,is_archived.eq.false')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return storeRowToModel(data)
}

/**
 * Get a store by place_id (for deduplication)
 *
 * Excludes archived stores to prevent returning merged duplicates.
 */
export async function getStoreByPlaceId(placeId: string): Promise<Store | null> {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('place_id', placeId)
    .or('is_archived.is.null,is_archived.eq.false')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return storeRowToModel(data)
}

// NOTE: upsertStore has been moved to lib/ingestion/ to enforce the ingestion boundary (Gate 16).
// All store creation must go through the ingestion boundary.

// =============================================================================
// Lead Queries
// =============================================================================

/**
 * Create a lead event
 */
export async function createLead(lead: LeadInsert): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any).from('leads').insert(lead)
  if (error) throw error
}

// =============================================================================
// Contact Queries
// =============================================================================

/**
 * Create a contact submission
 */
export async function createContactSubmission(
  submission: ContactSubmissionInsert
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('contact_submissions')
    .insert(submission)
  if (error) throw error
}

// =============================================================================
// Count Queries (for Gate 8 verification)
// =============================================================================

/**
 * Get count mismatches between stored counts and actual counts
 */
export async function getCountMismatches(): Promise<
  Array<{ table: string; id: number; stored: number; actual: number }>
> {
  const mismatches: Array<{
    table: string
    id: number
    stored: number
    actual: number
  }> = []

  // Check city store counts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cities } = await (supabaseAdmin as any).from('cities').select('id, store_count')

  for (const city of (cities ?? []) as Array<{ id: number; store_count: number }>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabaseAdmin as any)
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', city.id)
      .eq('is_approved', true)

    if (count !== city.store_count) {
      mismatches.push({
        table: 'cities',
        id: city.id,
        stored: city.store_count,
        actual: count ?? 0,
      })
    }
  }

  // Check state store counts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: states } = await (supabaseAdmin as any).from('states').select('id, store_count')

  for (const state of (states ?? []) as Array<{ id: number; store_count: number }>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabaseAdmin as any)
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('state_id', state.id)
      .eq('is_approved', true)

    if (count !== state.store_count) {
      mismatches.push({
        table: 'states',
        id: state.id,
        stored: state.store_count,
        actual: count ?? 0,
      })
    }
  }

  return mismatches
}

// =============================================================================
// Store Submission Queries (Slice 4 - Isolated from Directory)
// =============================================================================

/**
 * Create a store submission (untrusted, pending review)
 * This does NOT create a Store record.
 * This does NOT affect the directory.
 */
export async function createStoreSubmission(
  submission: StoreSubmissionInsert
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('store_submissions')
    .insert(submission)
  if (error) throw error
}

/**
 * Create a pending submission with verification code (for email verification flow)
 * Returns the created submission with ID
 */
export async function createPendingSubmission(
  submission: StoreSubmissionInsert
): Promise<{ id: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('store_submissions')
    .insert(submission)
    .select('id')
    .single()

  if (error) throw error
  return { id: data.id }
}

/**
 * Get a submission by ID (includes verification fields)
 */
export async function getSubmissionById(
  submissionId: string
): Promise<StoreSubmissionRow | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('store_submissions')
    .select('*')
    .eq('id', submissionId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

/**
 * Mark a submission as email verified
 */
export async function verifySubmission(submissionId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('store_submissions')
    .update({
      email_verified_at: new Date().toISOString(),
      verification_code_hash: null, // Clear the code after verification
    })
    .eq('id', submissionId)

  if (error) throw error
}

/**
 * Increment verification attempts for a submission
 */
export async function incrementVerificationAttempts(
  submissionId: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .rpc('increment_verification_attempts', { submission_id: submissionId })

  // If RPC doesn't exist, fall back to manual update
  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabaseAdmin as any)
      .from('store_submissions')
      .select('verification_attempts')
      .eq('id', submissionId)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabaseAdmin as any)
      .from('store_submissions')
      .update({ verification_attempts: (data?.verification_attempts || 0) + 1 })
      .eq('id', submissionId)
  }
}

/**
 * Resend verification code for a submission
 * Returns the new code (unhashed) for sending via email
 */
export async function updateVerificationCode(
  submissionId: string,
  codeHash: string,
  expiresAt: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('store_submissions')
    .update({
      verification_code_hash: codeHash,
      verification_expires_at: expiresAt,
      verification_attempts: 0, // Reset attempts on resend
    })
    .eq('id', submissionId)

  if (error) throw error
}

// =============================================================================
// Admin Queries (Slice 6 - Trust Promotion)
// =============================================================================

function storeSubmissionRowToModel(row: StoreSubmissionRow): StoreSubmission {
  return {
    id: row.id,
    businessName: row.business_name,
    streetAddress: row.street_address,
    city: row.city,
    state: row.state,
    zipcode: row.zipcode,
    phone: row.phone,
    website: row.website,
    email: row.email,
    emailVerifiedAt: row.email_verified_at,
    googlePlaceId: row.google_place_id,
    status: row.status,
    submittedAt: row.submitted_at,
    rejectedAt: row.rejected_at,
  }
}

/**
 * Get all pending store submissions (admin only)
 * Returns submissions with status='pending' AND email verified, ordered by submitted_at DESC
 */
export async function getPendingSubmissions(): Promise<StoreSubmission[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('store_submissions')
    .select('*')
    .eq('status', 'pending')
    .not('email_verified_at', 'is', null)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(storeSubmissionRowToModel)
}

/**
 * Approve a store submission
 * Delegates to ingestion boundary for store creation.
 *
 * @param submissionId - The ID of the submission to approve
 * @param adminUserId - The admin user approving the submission (for audit)
 * @returns The created Store
 * @throws Error if submission not found or store creation fails
 */
export async function approveSubmission(
  submissionId: string,
  adminUserId: string = 'system'
): Promise<Store> {
  // Delegate to ingestion boundary (Gate 16 enforcement)
  const { ingestStoreFromSubmission } = await import('@/lib/ingestion')
  return ingestStoreFromSubmission(submissionId, adminUserId)
}

/**
 * Reject a store submission - SOFT REJECT
 * Sets status='rejected' and rejected_at timestamp.
 * Does NOT delete the submission - preserves audit trail.
 * Does NOT create any Store record.
 *
 * @param submissionId - The ID of the submission to reject
 */
export async function rejectSubmission(submissionId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('store_submissions')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .eq('status', 'pending')

  if (error) throw error
}

// =============================================================================
// CTA Event Queries (Slice 10 - Operator Control)
// =============================================================================

/**
 * Insert a CTA event for analytics tracking
 * Events are raw data - leads table can be derived from these
 */
export async function insertCtaEvent(event: CtaEventInsert): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('cta_events')
    .insert(event)
  if (error) throw error
}

// =============================================================================
// Store Claim Queries (Slice 10 - Operator Control)
// =============================================================================

function storeClaimRowToModel(row: StoreClaimRow): StoreClaim {
  return {
    id: row.id,
    storeId: row.store_id,
    userId: row.user_id,
    status: row.status,
    notes: row.notes,
    claimerName: row.claimer_name,
    claimerEmail: row.claimer_email,
    claimerPhone: row.claimer_phone,
    claimerRelationship: row.claimer_relationship,
    verificationNotes: row.verification_notes,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
  }
}

/**
 * Create a store claim (pending admin approval)
 * Does NOT modify stores.claimed_by - that happens via trigger on approval
 */
export async function createClaim(claim: StoreClaimInsert): Promise<StoreClaim> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('store_claims')
    .insert(claim)
    .select()
    .single()

  if (error) throw error
  return storeClaimRowToModel(data as StoreClaimRow)
}

/**
 * Get all pending store claims (admin only)
 */
export async function getPendingClaims(): Promise<StoreClaim[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('store_claims')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(storeClaimRowToModel)
}

/**
 * Get all pending store claims with store info (admin only)
 */
export async function getPendingClaimsWithStores(): Promise<
  Array<StoreClaim & { storeName: string; storeAddress: string }>
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('store_claims')
    .select('*, stores(name, address)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(
    (row: StoreClaimRow & { stores: { name: string; address: string } }) => ({
      ...storeClaimRowToModel(row),
      storeName: row.stores?.name ?? 'Unknown',
      storeAddress: row.stores?.address ?? '',
    })
  )
}

/**
 * Approve a store claim
 * The database trigger will update stores.claimed_by automatically
 */
export async function approveClaim(
  claimId: string,
  reviewedBy: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('store_claims')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq('id', claimId)
    .eq('status', 'pending')

  if (error) throw error
}

/**
 * Reject a store claim
 */
export async function rejectClaim(
  claimId: string,
  reviewedBy: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('store_claims')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq('id', claimId)
    .eq('status', 'pending')

  if (error) throw error
}

/**
 * Get existing claim for a store by a specific user
 * Used to prevent duplicate claims
 */
export async function getExistingClaim(
  storeId: number,
  userId: string
): Promise<StoreClaim | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('store_claims')
    .select('*')
    .eq('store_id', storeId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
  if (!data) return null
  return storeClaimRowToModel(data as StoreClaimRow)
}

/**
 * Get all claims by a user with store details
 * Used to show pending/rejected claims in user dashboard
 */
export async function getClaimsByUserId(
  userId: string
): Promise<Array<StoreClaim & { storeName: string; storeAddress: string }>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('store_claims')
    .select('*, stores(name, address)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(
    (row: StoreClaimRow & { stores: { name: string; address: string } }) => ({
      ...storeClaimRowToModel(row),
      storeName: row.stores?.name ?? 'Unknown',
      storeAddress: row.stores?.address ?? '',
    })
  )
}

// =============================================================================
// Tier Management Queries (Slice 10 - Operator Control)
// =============================================================================

/**
 * Get all stores for admin management (paginated)
 */
export async function getStoresForAdmin(
  limit = 50,
  offset = 0
): Promise<{ stores: Store[]; total: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error, count } = await (supabaseAdmin as any)
    .from('stores')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return {
    stores: (data ?? []).map(storeRowToModel),
    total: count ?? 0,
  }
}

/**
 * Set store tier (does NOT modify is_featured)
 * Tier ≠ Exposure. Tier is monetization status, is_featured is SEO exposure.
 * Used by admin UI for manual tier assignment.
 */
export async function setStoreTier(
  storeId: number,
  tier: 'monthly' | 'annual' | null,
  featuredUntil: string | null
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('stores')
    .update({
      featured_tier: tier,
      featured_until: featuredUntil,
    })
    .eq('id', storeId)

  if (error) throw error
}

/**
 * Set store featured status (SEO exposure toggle)
 * Separate from tier - allows manual exposure control
 */
export async function setStoreFeatured(
  storeId: number,
  isFeatured: boolean
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('stores')
    .update({ is_featured: isFeatured })
    .eq('id', storeId)

  if (error) throw error
}

// =============================================================================
// Admin Auth Queries (Slice 10 - Operator Control)
// =============================================================================

/**
 * Check if a user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data !== null
}

/**
 * Get admin role for a user (null if not admin)
 */
export async function getAdminRole(
  userId: string
): Promise<'admin' | 'super_admin' | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('admin_users')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return (data as AdminUserRow | null)?.role ?? null
}

// =============================================================================
// Rate Limiting Queries (Slice 11 - Hardening)
// =============================================================================

/**
 * Check CTA rate limit (durable, Postgres-based)
 * Returns true if request is allowed, false if rate limited
 */
export async function checkCtaRateLimit(
  ipHash: string,
  storeId: number,
  windowMinutes = 1,
  maxEvents = 60
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any).rpc('check_cta_rate_limit', {
    p_ip_hash: ipHash,
    p_store_id: storeId,
    p_window_minutes: windowMinutes,
    p_max_events: maxEvents,
  })

  if (error) {
    console.error('Rate limit check error:', error)
    // On error, allow the request (fail open for availability)
    return true
  }

  return data === true
}

/**
 * Check store hourly rate limit (anti-abuse)
 * Returns true if request is allowed, false if rate limited
 */
export async function checkStoreHourlyRateLimit(
  storeId: number,
  maxEvents = 1000
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any).rpc('check_store_hourly_rate_limit', {
    p_store_id: storeId,
    p_max_events: maxEvents,
  })

  if (error) {
    console.error('Store rate limit check error:', error)
    // On error, allow the request (fail open for availability)
    return true
  }

  return data === true
}

/**
 * Check if a store exists (validation before event insert)
 */
export async function storeExists(storeId: number): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('stores')
    .select('id')
    .eq('id', storeId)
    .maybeSingle()

  if (error) {
    console.error('Store existence check error:', error)
    return false
  }

  return data !== null
}

// =============================================================================
// Stripe Integration Queries (Slice 13)
// =============================================================================
//
// ARCHITECTURAL INVARIANTS:
// 1. setStoreTierFromCheckout - called ONLY from checkout.session.completed
// 2. syncSubscription - called ONLY from customer.subscription.* events
// 3. NEVER clear tier from webhooks - tier lifecycle is time-based
// 4. is_featured is NEVER touched by these functions
//

/**
 * Set store tier from checkout (webhook handler only)
 * Called from checkout.session.completed event.
 * Does NOT create subscription record - that happens in subscription.created event.
 * Does NOT touch is_featured - that requires admin quality gate.
 */
export async function setStoreTierFromCheckout(
  storeId: number,
  tier: 'monthly' | 'annual',
  featuredUntil: Date
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('stores')
    .update({
      featured_tier: tier,
      featured_until: featuredUntil.toISOString(),
    })
    .eq('id', storeId)

  if (error) throw error
}

/**
 * Update store featured_until from subscription renewal
 * Called from customer.subscription.updated when subscription renews.
 * This ensures featured_until extends when subscription auto-renews.
 */
export async function updateStoreFeaturedUntil(
  storeId: number,
  featuredUntil: Date
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('stores')
    .update({
      featured_until: featuredUntil.toISOString(),
    })
    .eq('id', storeId)

  if (error) throw error
}

/**
 * Create or update subscription from webhook
 * Called from customer.subscription.created/updated events.
 * NEVER touches store tier - that's handled by checkout event.
 */
export async function syncSubscription(data: {
  stripeSubscriptionId: string
  stripeCustomerId: string
  storeId: number
  userId: string
  tier: 'monthly' | 'annual'
  status: string
  currentPeriodEnd: Date
}): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('subscriptions')
    .upsert(
      {
        stripe_subscription_id: data.stripeSubscriptionId,
        stripe_customer_id: data.stripeCustomerId,
        store_id: data.storeId,
        user_id: data.userId,
        tier: data.tier,
        status: data.status,
        current_period_end: data.currentPeriodEnd.toISOString(),
      },
      { onConflict: 'stripe_subscription_id' }
    )

  if (error) throw error
}

/**
 * Update subscription status only
 * Called from customer.subscription.deleted or invoice.payment_failed.
 * Does NOT touch store tier - let featured_until govern expiration.
 */
export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('subscriptions')
    .update({ status })
    .eq('stripe_subscription_id', stripeSubscriptionId)

  if (error) throw error
}

/**
 * Get subscription by Stripe customer ID
 */
export async function getSubscriptionByStripeCustomerId(
  stripeCustomerId: string
): Promise<{
  id: number
  storeId: number
  tier: 'monthly' | 'annual'
  status: string
  currentPeriodEnd: string
} | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('id, store_id, tier, status, current_period_end')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    storeId: data.store_id,
    tier: data.tier,
    status: data.status,
    currentPeriodEnd: data.current_period_end,
  }
}

// =============================================================================
// Webhook Idempotency Queries (Slice 13)
// =============================================================================

/**
 * Check if a webhook event has already been processed
 */
export async function getWebhookEvent(
  eventId: string
): Promise<{ event_id: string } | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('stripe_webhook_events')
    .select('event_id')
    .eq('event_id', eventId)
    .maybeSingle()

  if (error) {
    // Table might not exist yet, treat as not processed
    if (error.code === '42P01') return null
    throw error
  }

  return data
}

/**
 * Record a webhook event as processed
 */
export async function recordWebhookEvent(
  eventId: string,
  eventType: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('stripe_webhook_events')
    .insert({
      event_id: eventId,
      event_type: eventType,
    })

  if (error) {
    // Ignore duplicate key errors (idempotency working as expected)
    if (error.code === '23505') return
    throw error
  }
}

/**
 * Clean up old webhook events for table hygiene
 * Deletes events older than specified days (default 90 days).
 * Call periodically via cron or admin action.
 */
export async function cleanupOldWebhookEvents(
  daysOld: number = 90
): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('stripe_webhook_events')
    .delete()
    .lt('processed_at', cutoffDate.toISOString())
    .select('event_id')

  if (error) throw error
  return data?.length ?? 0
}

// =============================================================================
// Stripe Customer Queries (Slice 13)
// =============================================================================

/**
 * Get Stripe customer ID for a user
 */
export async function getStripeCustomerId(
  userId: string
): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data?.stripe_customer_id ?? null
}

/**
 * Save Stripe customer ID for a user
 */
export async function saveStripeCustomerId(
  userId: string,
  stripeCustomerId: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('profiles')
    .update({ stripe_customer_id: stripeCustomerId })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Get a store by ID (for validation in checkout)
 *
 * Excludes archived stores unless includeArchived is true.
 * Use includeArchived=true only for internal redirect resolution.
 */
export async function getStoreById(
  storeId: number,
  includeArchived = false
): Promise<Store | null> {
  let query = supabaseAdmin.from('stores').select('*').eq('id', storeId)

  if (!includeArchived) {
    query = query.or('is_archived.is.null,is_archived.eq.false')
  }

  const { data, error } = await query.single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return storeRowToModel(data)
}

/**
 * Get user's stores (for dashboard)
 *
 * Excludes archived stores - user shouldn't see merged duplicates.
 */
export async function getStoresByUserId(userId: string): Promise<Store[]> {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('claimed_by', userId)
    .or('is_archived.is.null,is_archived.eq.false')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []).map(storeRowToModel)
}

// =============================================================================
// Subscription Queries (Stripe Hardening)
// =============================================================================

/**
 * Get subscriptions for a user (for billing dashboard)
 */
export async function getSubscriptionsByUserId(userId: string): Promise<{
  id: number
  storeId: number
  stripeCustomerId: string
  stripeSubscriptionId: string | null
  tier: 'monthly' | 'annual'
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  currentPeriodEnd: string | null
  createdAt: string
}[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row: {
    id: number
    store_id: number
    stripe_customer_id: string
    stripe_subscription_id: string | null
    tier: 'monthly' | 'annual'
    status: 'active' | 'canceled' | 'past_due' | 'incomplete'
    current_period_end: string | null
    created_at: string
  }) => ({
    id: row.id,
    storeId: row.store_id,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    tier: row.tier,
    status: row.status,
    currentPeriodEnd: row.current_period_end,
    createdAt: row.created_at,
  }))
}

// =============================================================================
// Admin Subscription Queries (Admin Visibility)
// =============================================================================

export interface SubscriptionWithStore {
  id: number
  storeId: number
  storeName: string
  storeAddress: string
  userId: string
  userEmail: string | null
  stripeCustomerId: string
  stripeSubscriptionId: string | null
  tier: 'monthly' | 'annual'
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  currentPeriodEnd: string | null
  createdAt: string
  featuredUntil: string | null
}

/**
 * Get all subscriptions with store info for admin view
 */
export async function getAllSubscriptionsForAdmin(
  limit: number = 100,
  offset: number = 0,
  statusFilter?: 'active' | 'past_due' | 'canceled' | 'all'
): Promise<SubscriptionWithStore[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabaseAdmin as any)
    .from('subscriptions')
    .select(`
      id,
      store_id,
      user_id,
      stripe_customer_id,
      stripe_subscription_id,
      tier,
      status,
      current_period_end,
      created_at,
      stores!inner(name, address, featured_until),
      profiles!inner(email)
    `)
    .order('current_period_end', { ascending: true, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) throw error

  return (data ?? []).map((row: {
    id: number
    store_id: number
    user_id: string
    stripe_customer_id: string
    stripe_subscription_id: string | null
    tier: 'monthly' | 'annual'
    status: 'active' | 'canceled' | 'past_due' | 'incomplete'
    current_period_end: string | null
    created_at: string
    stores: { name: string; address: string; featured_until: string | null }
    profiles: { email: string | null }
  }) => ({
    id: row.id,
    storeId: row.store_id,
    storeName: row.stores.name,
    storeAddress: row.stores.address,
    userId: row.user_id,
    userEmail: row.profiles.email,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    tier: row.tier,
    status: row.status,
    currentPeriodEnd: row.current_period_end,
    createdAt: row.created_at,
    featuredUntil: row.stores.featured_until,
  }))
}

/**
 * Get subscription counts for admin dashboard
 */
export async function getSubscriptionCounts(): Promise<{
  active: number
  pastDue: number
  canceled: number
  total: number
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('subscriptions')
    .select('status')

  if (error) throw error

  const counts = {
    active: 0,
    pastDue: 0,
    canceled: 0,
    total: (data ?? []).length,
  }

  for (const row of data ?? []) {
    if (row.status === 'active') counts.active++
    else if (row.status === 'past_due') counts.pastDue++
    else if (row.status === 'canceled') counts.canceled++
  }

  return counts
}

/**
 * Extend store featured_until by N days (admin override)
 */
export async function extendStoreFeatured(
  storeId: number,
  days: number
): Promise<void> {
  // First get current featured_until
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: store, error: fetchError } = await (supabaseAdmin as any)
    .from('stores')
    .select('featured_until')
    .eq('id', storeId)
    .single()

  if (fetchError) throw fetchError

  // Calculate new date: extend from current date or featured_until, whichever is later
  const now = new Date()
  const currentFeaturedUntil = store?.featured_until ? new Date(store.featured_until) : now
  const baseDate = currentFeaturedUntil > now ? currentFeaturedUntil : now
  const newFeaturedUntil = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabaseAdmin as any)
    .from('stores')
    .update({ featured_until: newFeaturedUntil.toISOString() })
    .eq('id', storeId)

  if (updateError) throw updateError
}
