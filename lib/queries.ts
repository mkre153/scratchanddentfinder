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
  StoreInsert,
  LeadInsert,
  ContactSubmissionInsert,
  StoreSubmissionInsert,
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
