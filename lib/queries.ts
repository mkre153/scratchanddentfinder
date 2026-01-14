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
 */
export async function getStoreById(storeId: number): Promise<Store | null> {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return storeRowToModel(data)
}

/**
 * Get user's stores (for dashboard)
 */
export async function getStoresByUserId(userId: string): Promise<Store[]> {
  const { data, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('claimed_by', userId)
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []).map(storeRowToModel)
}
