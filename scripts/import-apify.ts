#!/usr/bin/env npx tsx
/**
 * Apify Import Script
 *
 * Slice 0 (Backfill): Imports store data from compass/crawler-google-places JSON export.
 * Foundational, deterministic, boring.
 *
 * Usage:
 *   npx tsx scripts/import-apify.ts data.json
 *   npx tsx scripts/import-apify.ts data.json --dry-run
 *
 * Expected JSON Schema (compass/crawler-google-places):
 * [
 *   {
 *     "title": "Store Name",
 *     "street": "123 Main St",
 *     "city": "San Diego",
 *     "state": "California",
 *     "countryCode": "US",
 *     "phone": "(858) 555-1234",
 *     "website": "https://...",
 *     "totalScore": 4.5,
 *     "reviewsCount": 127,
 *     "categoryName": "Appliance store",
 *     "url": "https://www.google.com/maps/search/?api=1&query=...&query_place_id=ChIJ..."
 *   }
 * ]
 */

import * as fs from 'fs'
import * as path from 'path'
import { supabaseAdmin } from '../lib/supabase/admin'
import { getOrCreateCity, upsertStore, getStoreByPlaceId } from '../lib/queries'
import type { StoreInsert } from '../lib/types'

// =============================================================================
// Types
// =============================================================================

interface ApifyPlace {
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

interface ImportStats {
  processed: number
  inserted: number
  updated: number
  skipped: number
  errors: number
}

// =============================================================================
// State Name to Slug/Code Mapping
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

// Categories to include (appliance-related)
const INCLUDE_CATEGORIES = [
  'appliance store',
  'home appliance store',
  'appliance repair service',
  'refrigerator store',
  'used appliance store',
  'scratch and dent',
  'appliance outlet',
]

// Categories to exclude
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

// =============================================================================
// Helpers
// =============================================================================

/**
 * Extract place_id from Google Maps URL
 * URL format: https://www.google.com/maps/search/?api=1&query=...&query_place_id=ChIJ...
 */
function extractPlaceId(url: string | undefined): string | null {
  if (!url) return null

  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('query_place_id')
  } catch {
    // Try regex fallback for malformed URLs
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
    .substring(0, 100) // Limit slug length
}

/**
 * Normalize phone to digits only (for storage)
 */
function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  // Must have at least 10 digits for US phone
  return digits.length >= 10 ? digits : null
}

/**
 * Normalize website URL
 */
function normalizeWebsite(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // Skip malformed Google redirect URLs
  if (trimmed.startsWith('/url?')) return null

  // Ensure https prefix
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`
  }
  return trimmed
}

/**
 * Check if category is relevant for appliance stores
 */
function isRelevantCategory(categoryName: string | undefined): boolean {
  if (!categoryName) return false

  const category = categoryName.toLowerCase()

  // Check exclusions first
  for (const exclude of EXCLUDE_CATEGORIES) {
    if (category.includes(exclude)) {
      return false
    }
  }

  // Check inclusions
  for (const include of INCLUDE_CATEGORIES) {
    if (category.includes(include)) {
      return true
    }
  }

  // Default: include if it has "appliance" in the name
  return category.includes('appliance')
}

/**
 * Build full address from components
 */
function buildAddress(street: string, city: string, state: string): string {
  return `${street}, ${city}, ${state}`
}

// =============================================================================
// Main Import Function
// =============================================================================

async function importApifyData(filePath: string, isDryRun: boolean): Promise<void> {
  console.log(`Importing from: ${filePath}`)
  if (isDryRun) {
    console.log('(DRY RUN - no changes will be made)')
  }
  console.log()

  // Load and parse JSON file
  const absolutePath = path.resolve(filePath)
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`)
  }

  const rawData = fs.readFileSync(absolutePath, 'utf8')
  const places: ApifyPlace[] = JSON.parse(rawData)

  if (!Array.isArray(places)) {
    throw new Error('JSON file must contain an array of places')
  }

  console.log(`Found ${places.length} places to process`)
  console.log()

  const stats: ImportStats = {
    processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }

  for (const place of places) {
    stats.processed++

    try {
      // Filter by category
      if (!isRelevantCategory(place.categoryName)) {
        console.log(`  SKIP: "${place.title}" - category "${place.categoryName}" not relevant`)
        stats.skipped++
        continue
      }

      // Extract place_id from URL
      const placeId = extractPlaceId(place.url)
      if (!placeId) {
        console.log(`  SKIP: "${place.title}" - no place_id in URL`)
        stats.skipped++
        continue
      }

      // Validate required fields
      if (!place.title) {
        console.log(`  SKIP: Missing title for place_id ${placeId}`)
        stats.skipped++
        continue
      }

      if (!place.street) {
        console.log(`  SKIP: "${place.title}" - missing street address`)
        stats.skipped++
        continue
      }

      if (!place.city) {
        console.log(`  SKIP: "${place.title}" - missing city`)
        stats.skipped++
        continue
      }

      if (!place.state) {
        console.log(`  SKIP: "${place.title}" - missing state`)
        stats.skipped++
        continue
      }

      // Look up state data
      const stateName = place.state.toLowerCase()
      const stateData = STATE_NAME_TO_DATA[stateName]

      if (!stateData) {
        console.log(`  ERROR: "${place.title}" - unknown state "${place.state}"`)
        stats.errors++
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
        stats.errors++
        continue
      }

      // Check if store already exists
      const existing = await getStoreByPlaceId(placeId)
      const isUpdate = !!existing

      if (isDryRun) {
        if (isUpdate) {
          console.log(`  UPDATE: ${place.title} (${place.city}, ${stateData.code.toUpperCase()})`)
          stats.updated++
        } else {
          console.log(`  INSERT: ${place.title} (${place.city}, ${stateData.code.toUpperCase()})`)
          stats.inserted++
        }
        continue
      }

      // Get or create city
      const city = await getOrCreateCity(
        dbState.id,
        stateData.code,
        place.city,
        null, // No lat in this data
        null  // No lng in this data
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

      // Upsert store
      await upsertStore(storeData)

      if (isUpdate) {
        console.log(`  UPDATE: ${place.title} (${place.city}, ${stateData.code.toUpperCase()})`)
        stats.updated++
      } else {
        console.log(`  INSERT: ${place.title} (${place.city}, ${stateData.code.toUpperCase()})`)
        stats.inserted++
      }
    } catch (err) {
      const name = place.title || 'unknown'
      console.error(`  ERROR: Failed to process "${name}":`, err)
      stats.errors++
    }
  }

  // Print summary
  console.log()
  console.log('═'.repeat(50))
  console.log('  IMPORT SUMMARY')
  console.log('═'.repeat(50))
  console.log(`  Processed: ${stats.processed}`)
  console.log(`  Inserted:  ${stats.inserted}`)
  console.log(`  Updated:   ${stats.updated}`)
  console.log(`  Skipped:   ${stats.skipped}`)
  console.log(`  Errors:    ${stats.errors}`)
  console.log('═'.repeat(50))

  if (isDryRun) {
    console.log()
    console.log('(DRY RUN complete - no changes were made)')
  } else if (stats.inserted > 0 || stats.updated > 0) {
    console.log()
    console.log('Run `npx tsx scripts/counts-recompute.ts` to update store counts.')
  }

  if (stats.errors > 0) {
    process.exit(1)
  }
}

// =============================================================================
// CLI Entry Point
// =============================================================================

const args = process.argv.slice(2)
const filePath = args.find((arg) => !arg.startsWith('--'))
const isDryRun = args.includes('--dry-run')

if (!filePath) {
  console.error('Usage: npx tsx scripts/import-apify.ts <file.json> [--dry-run]')
  console.error()
  console.error('Imports data from compass/crawler-google-places Apify actor.')
  console.error()
  console.error('Options:')
  console.error('  --dry-run    Preview changes without writing to database')
  process.exit(1)
}

importApifyData(filePath, isDryRun).catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
