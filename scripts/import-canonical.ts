#!/usr/bin/env npx tsx
/**
 * Import Canonical JSON from Data-Miner
 *
 * Imports staged data from directory-data-miner into production database.
 * Follows the ingestion boundary pattern (lib/ingestion).
 *
 * Usage:
 *   npx tsx scripts/import-canonical.ts --file <path> --batch-id <id> [--dry-run] [--confidence 0.85]
 *
 * Options:
 *   --file         Path to canonical.json file
 *   --batch-id     Batch identifier for rollback (e.g., sdf-batch-0-6)
 *   --dry-run      Preview without writing to database
 *   --confidence   Minimum confidence threshold (default: 0.85)
 *
 * Example:
 *   npx tsx scripts/import-canonical.ts \
 *     --file /tmp/sdf-output/sdf-batch-0-6/2026-01-15-scratchanddentfinder-batch-00/canonical.json \
 *     --batch-id sdf-batch-0-6 \
 *     --dry-run
 */

import fs from 'node:fs'

// =============================================================================
// Types
// =============================================================================

interface CanonicalPlace {
  name: string
  address: string
  city: string
  state: string // Full name like "North Carolina"
  lat: number
  lng: number
  phone: string | null
  website?: string | null
  categories: string[]
  external_ids: {
    google_place_id: string
  }
  confidence: number
}

interface ImportOptions {
  filePath: string
  batchId: string
  dryRun: boolean
  confidenceThreshold: number
}

interface ImportStats {
  total: number
  eligible: number
  inserted: number
  skipped: number
  errors: number
}

interface SkipReasons {
  missingPlaceId: number
  emptyName: number
  emptyAddress: number
  emptyState: number
  emptyCity: number
  alreadyExists: number
}

/**
 * Validate required fields before attempting DB insert
 */
function validatePlace(place: CanonicalPlace): { valid: boolean; reason?: string } {
  // Required: google_place_id
  if (!place.external_ids?.google_place_id) {
    return { valid: false, reason: 'Missing google_place_id' }
  }

  // Required: name
  if (!place.name?.trim()) {
    return { valid: false, reason: 'Missing or empty name' }
  }

  // Required: address
  if (!place.address?.trim()) {
    return { valid: false, reason: 'Missing or empty address' }
  }

  // Required: state (must be mappable)
  if (!place.state?.trim()) {
    return { valid: false, reason: 'Missing state' }
  }

  return { valid: true }
}

// =============================================================================
// State Name → Code Mapping
// =============================================================================

const STATE_NAME_TO_CODE: Record<string, string> = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY',
}

/**
 * Convert state name or code to 2-letter code
 */
function normalizeStateCode(state: string): string {
  // Already a 2-letter code?
  if (state.length === 2) {
    return state.toUpperCase()
  }
  // Look up from full name
  const code = STATE_NAME_TO_CODE[state]
  if (!code) {
    throw new Error(`Unknown state: ${state}`)
  }
  return code
}

/**
 * Convert state code to database slug format
 */
function stateCodeToSlug(code: string): string {
  // Reverse lookup: code → name → slug
  const entry = Object.entries(STATE_NAME_TO_CODE).find(([_, c]) => c === code)
  if (!entry) {
    throw new Error(`Unknown state code: ${code}`)
  }
  const name = entry[0]
  return name.toLowerCase().replace(/\s+/g, '-')
}

// =============================================================================
// CLI
// =============================================================================

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2)

  let filePath = ''
  let batchId = ''
  let dryRun = false
  let confidenceThreshold = 0.85

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
        filePath = args[++i]
        break
      case '--batch-id':
        batchId = args[++i]
        break
      case '--dry-run':
        dryRun = true
        break
      case '--confidence':
        confidenceThreshold = parseFloat(args[++i])
        break
      case '--help':
        console.log(`
Usage: npx tsx scripts/import-canonical.ts [options]

Options:
  --file <path>       Path to canonical.json file (required)
  --batch-id <id>     Batch identifier for rollback (required)
  --dry-run           Preview without writing to database
  --confidence <n>    Minimum confidence threshold (default: 0.85)
  --help              Show this help message
`)
        process.exit(0)
    }
  }

  if (!filePath) {
    console.error('Error: --file is required')
    process.exit(1)
  }
  if (!batchId) {
    console.error('Error: --batch-id is required')
    process.exit(1)
  }

  return { filePath, batchId, dryRun, confidenceThreshold }
}

// =============================================================================
// Main (with dynamic imports after env loading)
// =============================================================================

async function main(): Promise<void> {
  const options = parseArgs()

  console.log('═'.repeat(60))
  console.log('  IMPORT CANONICAL DATA')
  console.log('═'.repeat(60))
  console.log(`  Batch ID:            ${options.batchId}`)
  console.log(`  Confidence Threshold: ${options.confidenceThreshold}`)
  console.log(`  Mode:                ${options.dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log('═'.repeat(60))

  // Read and parse canonical.json (before loading DB)
  console.log(`\n📁 Reading: ${options.filePath}`)
  const raw = fs.readFileSync(options.filePath, 'utf-8')
  const places: CanonicalPlace[] = JSON.parse(raw)

  console.log(`   Total records: ${places.length}`)

  // Filter by confidence
  const eligible = places.filter(p => p.confidence >= options.confidenceThreshold)
  console.log(`   Meet threshold (≥${options.confidenceThreshold}): ${eligible.length}`)
  console.log()

  const stats: ImportStats = {
    total: places.length,
    eligible: eligible.length,
    inserted: 0,
    skipped: 0,
    errors: 0,
  }

  if (options.dryRun) {
    console.log('🔍 DRY RUN - No database writes')
    console.log()
    console.log('Preview (first 10):')
    for (const place of eligible.slice(0, 10)) {
      const stateCode = normalizeStateCode(place.state)
      console.log(`   ${place.name} (${place.city}, ${stateCode}) [${place.confidence}]`)
    }
    if (eligible.length > 10) {
      console.log(`   ... and ${eligible.length - 10} more`)
    }
    printStats(stats)
    return
  }

  // =========================================================================
  // LIVE MODE: Load environment and database modules
  // =========================================================================
  console.log('📡 Loading database connection...')

  // Load environment variables
  const { config } = await import('dotenv')
  config({ path: '.env.local' })

  // Now import database modules (after env is loaded)
  const { supabaseAdmin } = await import('../lib/supabase/admin')
  const { ensureCity, logIngestion } = await import('../lib/ingestion')

  // -------------------------------------------------------------------------
  // Database helper functions (use loaded supabaseAdmin)
  // -------------------------------------------------------------------------

  async function getStateBySlug(slug: string): Promise<{ id: number; slug: string } | null> {
    const { data, error } = await supabaseAdmin
      .from('states')
      .select('id, slug')
      .eq('slug', slug)
      .single<{ id: number; slug: string }>()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  async function storeExistsByGooglePlaceId(googlePlaceId: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin as any)
      .from('stores')
      .select('id')
      .eq('google_place_id', googlePlaceId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }
    return !!data
  }

  async function insertStore(
    place: CanonicalPlace,
    cityId: number,
    stateId: number,
    batchId: string,
    confidenceThreshold: number
  ): Promise<void> {
    // Generate deterministic slug
    const slug = `${place.name}-${place.city}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Generate place_id from google_place_id
    const placeId = `google_${place.external_ids.google_place_id}`

    const now = new Date().toISOString()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
      .from('stores')
      .insert({
        place_id: placeId,
        user_id: null,
        name: place.name,
        slug,
        address: place.address,
        city_id: cityId,
        state_id: stateId,
        zip: null,
        phone: place.phone,
        website: place.website ?? null,
        description: null,
        hours: null,
        appliances: null,
        services: null,
        rating: null,
        review_count: null,
        is_featured: false,
        featured_tier: null,
        featured_until: null,
        lat: place.lat,
        lng: place.lng,
        is_approved: true,
        is_verified: true, // Ingestion boundary guarantees this
        claimed_by: null,
        claimed_at: null,
        // Promotion tracking columns (from migration 0010)
        source: 'outscraper',
        batch_id: batchId,
        google_place_id: place.external_ids.google_place_id,
        ingested_at: now,
        promotion_metadata: {
          promoted_by: 'import-canonical',
          promoted_at: now,
          source_batch_id: batchId,
          confidence_threshold: confidenceThreshold,
          original_confidence: place.confidence,
        },
      })

    if (error) {
      throw error
    }
  }

  // -------------------------------------------------------------------------
  // Process each place
  // -------------------------------------------------------------------------
  console.log()
  console.log('📥 Importing stores...')
  console.log()

  // Track skip reasons for summary
  const skipReasons: SkipReasons = {
    missingPlaceId: 0,
    emptyName: 0,
    emptyAddress: 0,
    emptyState: 0,
    emptyCity: 0,
    alreadyExists: 0,
  }

  for (const place of eligible) {
    try {
      // Validate required fields first
      const validation = validatePlace(place)
      if (!validation.valid) {
        console.log(`   SKIP: ${place.name || '(unnamed)'} - ${validation.reason}`)
        stats.skipped++
        // Track skip reason
        if (validation.reason?.includes('google_place_id')) skipReasons.missingPlaceId++
        else if (validation.reason?.includes('name')) skipReasons.emptyName++
        else if (validation.reason?.includes('address')) skipReasons.emptyAddress++
        else if (validation.reason?.includes('state')) skipReasons.emptyState++
        continue
      }

      // Check if already exists
      const exists = await storeExistsByGooglePlaceId(place.external_ids.google_place_id)
      if (exists) {
        console.log(`   SKIP: ${place.name} (already exists)`)
        stats.skipped++
        skipReasons.alreadyExists++
        continue
      }

      // Normalize state
      const stateCode = normalizeStateCode(place.state)
      const stateSlug = stateCodeToSlug(stateCode)

      // Get state from database
      const state = await getStateBySlug(stateSlug)
      if (!state) {
        console.error(`   ERROR: ${place.name} - State not found: ${stateSlug}`)
        stats.errors++
        continue
      }

      // Normalize city: empty string → skip record (do not infer)
      const cityName = place.city?.trim()
      if (!cityName) {
        console.log(`   SKIP: ${place.name} - Empty city name`)
        stats.skipped++
        skipReasons.emptyCity++
        continue
      }

      // Ensure city exists (creates if needed)
      const city = await ensureCity(
        state.id,
        stateCode,
        cityName,
        place.lat,
        place.lng
      )

      // Insert store
      await insertStore(place, city.id, state.id, options.batchId, options.confidenceThreshold)
      console.log(`   INSERT: ${place.name} (${place.city}, ${stateCode})`)
      stats.inserted++

    } catch (err) {
      // Supabase errors are objects with message, details, hint, code
      let message: string
      if (err && typeof err === 'object' && 'message' in err) {
        const supaErr = err as { message: string; details?: string; hint?: string; code?: string }
        message = supaErr.message
        if (supaErr.details) message += ` | Details: ${supaErr.details}`
        if (supaErr.hint) message += ` | Hint: ${supaErr.hint}`
        if (supaErr.code) message += ` | Code: ${supaErr.code}`
      } else {
        message = err instanceof Error ? err.message : String(err)
      }
      console.error(`   ERROR: ${place.name} (${place.city || 'no city'}, ${place.state || 'no state'}) - ${message}`)
      stats.errors++
    }
  }

  // Log ingestion operation
  if (stats.inserted > 0) {
    await logIngestion('csv_import', options.batchId, stats.inserted, 'import-canonical')
  }

  printStats(stats, skipReasons)

  if (stats.errors > 0) {
    process.exit(1)
  }
}

function printStats(stats: ImportStats, skipReasons?: SkipReasons): void {
  console.log()
  console.log('═'.repeat(60))
  console.log('  RESULTS')
  console.log('═'.repeat(60))
  console.log(`  Total records:    ${stats.total}`)
  console.log(`  Eligible:         ${stats.eligible}`)
  console.log(`  Inserted:         ${stats.inserted}`)
  console.log(`  Skipped:          ${stats.skipped}`)
  console.log(`  Errors:           ${stats.errors}`)

  if (skipReasons && stats.skipped > 0) {
    console.log()
    console.log('  Skipped breakdown:')
    if (skipReasons.alreadyExists > 0) console.log(`    - Already exists: ${skipReasons.alreadyExists}`)
    if (skipReasons.emptyCity > 0) console.log(`    - Empty city: ${skipReasons.emptyCity}`)
    if (skipReasons.missingPlaceId > 0) console.log(`    - Missing google_place_id: ${skipReasons.missingPlaceId}`)
    if (skipReasons.emptyName > 0) console.log(`    - Empty name: ${skipReasons.emptyName}`)
    if (skipReasons.emptyAddress > 0) console.log(`    - Empty address: ${skipReasons.emptyAddress}`)
    if (skipReasons.emptyState > 0) console.log(`    - Empty state: ${skipReasons.emptyState}`)
  }
  console.log('═'.repeat(60))
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
