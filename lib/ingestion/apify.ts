/**
 * Apify Import Source
 *
 * Handles bulk import from Apify Google Places data.
 * Called by scripts/import-apify.ts
 *
 * This module is responsible for:
 * - Transforming Apify data to store format
 * - Setting is_verified = true on all ingested stores
 * - Logging the operation
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { StoreInsert, Store, StoreRow } from '@/lib/types'
import { ensureCity, logIngestion } from './index'

// =============================================================================
// Types
// =============================================================================

export interface ApifyPlace {
  title?: string
  street?: string
  city?: string
  state?: string // Full state name like "California"
  countryCode?: string
  phone?: string | null
  website?: string | null
  totalScore?: number | null
  reviewsCount?: number | null
  categoryName?: string
  url?: string // Google Maps URL with query_place_id
}

export interface ApifyImportResult {
  created: number
  updated: number
  skipped: number
  errors: number
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Extract place_id from Google Maps URL
 */
function extractPlaceId(url: string | undefined): string | null {
  if (!url) return null

  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('query_place_id')
  } catch {
    const match = url.match(/query_place_id=([^&]+)/)
    return match ? match[1] : null
  }
}

/**
 * Generate deterministic slug from store name and city
 */
function generateStoreSlug(name: string, city: string): string {
  const combined = `${name}-${city}`
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
}

/**
 * Normalize phone to digits only
 */
function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 ? digits : null
}

/**
 * Normalize website URL
 */
function normalizeWebsite(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('/url?')) return null

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`
  }
  return trimmed
}

/**
 * Build full address from components
 */
function buildAddress(street: string, city: string, state: string): string {
  return `${street}, ${city}, ${state}`
}

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
 * Get a store by place_id (for deduplication)
 */
async function getStoreByPlaceId(placeId: string): Promise<Store | null> {
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
 * Upsert a store (insert or update on place_id conflict)
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
// State Lookup
// =============================================================================

const STATE_NAME_TO_DATA: Record<string, { slug: string; code: string }> = {
  'alabama': { slug: 'alabama', code: 'al' },
  'alaska': { slug: 'alaska', code: 'ak' },
  'arizona': { slug: 'arizona', code: 'az' },
  'arkansas': { slug: 'arkansas', code: 'ar' },
  'california': { slug: 'california', code: 'ca' },
  'colorado': { slug: 'colorado', code: 'co' },
  'connecticut': { slug: 'connecticut', code: 'ct' },
  'delaware': { slug: 'delaware', code: 'de' },
  'florida': { slug: 'florida', code: 'fl' },
  'georgia': { slug: 'georgia', code: 'ga' },
  'hawaii': { slug: 'hawaii', code: 'hi' },
  'idaho': { slug: 'idaho', code: 'id' },
  'illinois': { slug: 'illinois', code: 'il' },
  'indiana': { slug: 'indiana', code: 'in' },
  'iowa': { slug: 'iowa', code: 'ia' },
  'kansas': { slug: 'kansas', code: 'ks' },
  'kentucky': { slug: 'kentucky', code: 'ky' },
  'louisiana': { slug: 'louisiana', code: 'la' },
  'maine': { slug: 'maine', code: 'me' },
  'maryland': { slug: 'maryland', code: 'md' },
  'massachusetts': { slug: 'massachusetts', code: 'ma' },
  'michigan': { slug: 'michigan', code: 'mi' },
  'minnesota': { slug: 'minnesota', code: 'mn' },
  'mississippi': { slug: 'mississippi', code: 'ms' },
  'missouri': { slug: 'missouri', code: 'mo' },
  'montana': { slug: 'montana', code: 'mt' },
  'nebraska': { slug: 'nebraska', code: 'ne' },
  'nevada': { slug: 'nevada', code: 'nv' },
  'new hampshire': { slug: 'new-hampshire', code: 'nh' },
  'new jersey': { slug: 'new-jersey', code: 'nj' },
  'new mexico': { slug: 'new-mexico', code: 'nm' },
  'new york': { slug: 'new-york', code: 'ny' },
  'north carolina': { slug: 'north-carolina', code: 'nc' },
  'north dakota': { slug: 'north-dakota', code: 'nd' },
  'ohio': { slug: 'ohio', code: 'oh' },
  'oklahoma': { slug: 'oklahoma', code: 'ok' },
  'oregon': { slug: 'oregon', code: 'or' },
  'pennsylvania': { slug: 'pennsylvania', code: 'pa' },
  'rhode island': { slug: 'rhode-island', code: 'ri' },
  'south carolina': { slug: 'south-carolina', code: 'sc' },
  'south dakota': { slug: 'south-dakota', code: 'sd' },
  'tennessee': { slug: 'tennessee', code: 'tn' },
  'texas': { slug: 'texas', code: 'tx' },
  'utah': { slug: 'utah', code: 'ut' },
  'vermont': { slug: 'vermont', code: 'vt' },
  'virginia': { slug: 'virginia', code: 'va' },
  'washington': { slug: 'washington', code: 'wa' },
  'west virginia': { slug: 'west-virginia', code: 'wv' },
  'wisconsin': { slug: 'wisconsin', code: 'wi' },
  'wyoming': { slug: 'wyoming', code: 'wy' },
}

// =============================================================================
// Category Filtering
// =============================================================================

const INCLUDE_CATEGORIES = [
  'appliance store',
  'home appliance store',
  'appliance repair service',
  'refrigerator store',
  'used appliance store',
  'scratch and dent',
  'appliance outlet',
]

const EXCLUDE_CATEGORIES = [
  'grocery store',
  'furniture store',
  'department store',
  'hardware store',
  'thrift store',
  'second hand store',
  'home goods store',
  'plumber',
  'hvac contractor',
  'discount store',
  'electronics store',
  'shopping mall',
  'convenience store',
  'restaurant supply store',
  'car stereo store',
  'camera store',
  'consignment shop',
  'grill store',
  'kitchen remodeler',
  'cabinet store',
  'home automation company',
  'audio visual equipment supplier',
  'home audio store',
  'variety store',
  'electrical supply store',
  'indian grocery store',
  'kitchen supply store',
]

function isRelevantCategory(categoryName: string | undefined): boolean {
  if (!categoryName) return false

  const category = categoryName.toLowerCase()

  for (const exclude of EXCLUDE_CATEGORIES) {
    if (category.includes(exclude)) {
      return false
    }
  }

  for (const include of INCLUDE_CATEGORIES) {
    if (category.includes(include)) {
      return true
    }
  }

  return category.includes('appliance')
}

// =============================================================================
// Main Ingestion Function
// =============================================================================

/**
 * Ingest stores from Apify data
 *
 * This is the ONLY way to bulk import stores into the system.
 * All stores ingested through this function:
 * - Get is_verified = true
 * - Get is_approved = true
 * - Are logged to ingestion_log
 *
 * @param places - Array of Apify place data
 * @param sourceFile - Source file name for logging
 * @param isDryRun - If true, don't actually write to DB
 * @returns Import statistics
 */
export async function ingestStoresFromApify(
  places: ApifyPlace[],
  sourceFile: string,
  isDryRun = false
): Promise<ApifyImportResult> {
  const result: ApifyImportResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }

  for (const place of places) {
    try {
      // Filter by category
      if (!isRelevantCategory(place.categoryName)) {
        console.log(`  SKIP: "${place.title}" - category "${place.categoryName}" not relevant`)
        result.skipped++
        continue
      }

      // Extract place_id
      const placeId = extractPlaceId(place.url)
      if (!placeId) {
        console.log(`  SKIP: "${place.title}" - no place_id in URL`)
        result.skipped++
        continue
      }

      // Validate required fields
      if (!place.title) {
        console.log(`  SKIP: Missing title for place_id ${placeId}`)
        result.skipped++
        continue
      }

      if (!place.street) {
        console.log(`  SKIP: "${place.title}" - missing street address`)
        result.skipped++
        continue
      }

      if (!place.city) {
        console.log(`  SKIP: "${place.title}" - missing city`)
        result.skipped++
        continue
      }

      if (!place.state) {
        console.log(`  SKIP: "${place.title}" - missing state`)
        result.skipped++
        continue
      }

      // Look up state data
      const stateName = place.state.toLowerCase()
      const stateData = STATE_NAME_TO_DATA[stateName]

      if (!stateData) {
        console.log(`  ERROR: "${place.title}" - unknown state "${place.state}"`)
        result.errors++
        continue
      }

      // Look up state in database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: dbStateData, error: stateError } = await (supabaseAdmin as any)
        .from('states')
        .select('id')
        .eq('slug', stateData.slug)
        .single()

      const dbState = dbStateData as { id: number } | null

      if (stateError || !dbState) {
        console.log(`  ERROR: "${place.title}" - state "${stateData.slug}" not found in database`)
        console.log(`         Run 'npx tsx scripts/seed-states.ts' first`)
        result.errors++
        continue
      }

      // Check if store already exists
      const existing = await getStoreByPlaceId(placeId)
      const isUpdate = !!existing

      if (isDryRun) {
        if (isUpdate) {
          console.log(`  UPDATE: ${place.title} (${place.city}, ${stateData.code.toUpperCase()})`)
          result.updated++
        } else {
          console.log(`  INSERT: ${place.title} (${place.city}, ${stateData.code.toUpperCase()})`)
          result.created++
        }
        continue
      }

      // Get or create city through ingestion boundary
      const city = await ensureCity(
        dbState.id,
        stateData.code,
        place.city,
        null,
        null
      )

      // Build full address
      const fullAddress = buildAddress(place.street, place.city, place.state)

      // Prepare store data
      const storeData: StoreInsert = {
        place_id: placeId,
        user_id: null,
        name: place.title,
        slug: generateStoreSlug(place.title, place.city),
        address: fullAddress,
        city_id: city.id,
        state_id: dbState.id,
        zip: null,
        phone: normalizePhone(place.phone),
        website: normalizeWebsite(place.website),
        description: null,
        hours: null,
        appliances: null,
        services: null,
        rating: place.totalScore ?? null,
        review_count: place.reviewsCount ?? null,
        is_featured: false,
        featured_tier: null,
        featured_until: null,
        lat: null,
        lng: null,
        is_approved: true, // Apify imports are trusted
        claimed_by: null,
        claimed_at: null,
      }

      // Upsert store with is_verified = true
      await upsertVerifiedStore(storeData)

      if (isUpdate) {
        console.log(`  UPDATE: ${place.title} (${place.city}, ${stateData.code.toUpperCase()})`)
        result.updated++
      } else {
        console.log(`  INSERT: ${place.title} (${place.city}, ${stateData.code.toUpperCase()})`)
        result.created++
      }
    } catch (err) {
      const name = place.title || 'unknown'
      console.error(`  ERROR: Failed to process "${name}":`, err)
      result.errors++
    }
  }

  // Log the operation (unless dry run)
  if (!isDryRun && (result.created > 0 || result.updated > 0)) {
    await logIngestion(
      'apify_import',
      sourceFile,
      result.created + result.updated,
      'import-apify-script'
    )
  }

  return result
}
