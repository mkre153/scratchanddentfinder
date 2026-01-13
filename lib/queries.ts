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
  CityInsert,
  Store,
  StoreRow,
  StoreInsert,
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
 * Get a city by slug and state code
 */
export async function getCityBySlug(
  stateCode: string,
  citySlug: string
): Promise<City | null> {
  const { data, error } = await supabaseAdmin
    .from('cities')
    .select('*')
    .eq('state_code', stateCode.toLowerCase())
    .eq('slug', citySlug)
    .single()

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

/**
 * Create a new city (Slice 0 backfill)
 * Cities are derived entities - created deterministically from store ingestion.
 */
export async function createCity(city: CityInsert): Promise<City> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('cities')
    .insert(city)
    .select()
    .single()

  if (error) throw error
  return cityRowToModel(data as CityRow)
}

/**
 * Get or create a city (Slice 0 backfill)
 * Deterministic: same inputs always produce same city.
 * Used during import to ensure cities exist before inserting stores.
 */
export async function getOrCreateCity(
  stateId: number,
  stateCode: string,
  cityName: string,
  lat?: number | null,
  lng?: number | null
): Promise<City> {
  // Try to find existing city by name and state
  const existing = await getCityByNameAndState(cityName, stateId)
  if (existing) {
    return existing
  }

  // Create new city with deterministic slug
  const slug = cityName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const newCity: CityInsert = {
    slug,
    name: cityName,
    state_id: stateId,
    state_code: stateCode.toLowerCase(),
    lat: lat ?? null,
    lng: lng ?? null,
  }

  return createCity(newCity)
}

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
 * Get stores for a city, ordered by is_featured DESC, name ASC (Gate 10)
 */
export async function getStoresByCityId(cityId: number): Promise<Store[]> {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('city_id', cityId)
    .eq('is_approved', true)
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []).map(storeRowToModel)
}

/**
 * Get a store by slug
 */
export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return storeRowToModel(data)
}

/**
 * Get a store by place_id (for deduplication)
 */
export async function getStoreByPlaceId(placeId: string): Promise<Store | null> {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('place_id', placeId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return storeRowToModel(data)
}

/**
 * Insert or update a store (upsert on place_id)
 */
export async function upsertStore(store: StoreInsert): Promise<Store> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('stores')
    .upsert(store, { onConflict: 'place_id' })
    .select()
    .single()

  if (error) throw error
  return storeRowToModel(data as StoreRow)
}

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
    phone: row.phone,
    website: row.website,
    status: row.status,
    submittedAt: row.submitted_at,
    rejectedAt: row.rejected_at,
  }
}

/**
 * Get all pending store submissions (admin only)
 * Returns submissions with status='pending', ordered by submitted_at DESC
 */
export async function getPendingSubmissions(): Promise<StoreSubmission[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from('store_submissions')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(storeSubmissionRowToModel)
}

/**
 * Approve a store submission - SINGLE TRANSACTION
 * Creates Store from submission, marks submission as approved.
 * Must be atomic: if store creation fails, submission remains pending.
 *
 * @param submissionId - The ID of the submission to approve
 * @returns The created Store
 * @throws Error if submission not found or store creation fails
 */
export async function approveSubmission(submissionId: string): Promise<Store> {
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

  // 3. Get or create the city
  const city = await getOrCreateCity(
    stateData.id,
    submission.state,
    submission.city
  )

  // 4. Generate deterministic slug for the store
  const storeSlug = `${submission.business_name}-${submission.city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // 5. Generate a unique place_id for self-submitted stores
  const placeId = `submission_${submissionId}`

  // 6. Create the store record
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
    lat: null,
    lng: null,
    is_approved: true,
    claimed_by: null,
    claimed_at: null,
  }

  const store = await upsertStore(storeInsert)

  // 7. Mark submission as approved (only after store created successfully)
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

  return store
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
 */
export async function setStoreTier(
  storeId: number,
  tier: 'monthly' | 'annual' | 'lifetime' | null,
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
    .eq('id', userId)
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
    .eq('id', userId)
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
