#!/usr/bin/env npx tsx
/**
 * Backfill ZIP Codes via Reverse Geocoding
 *
 * Uses Google Reverse Geocoding API to populate ZIP codes for stores
 * that have lat/lng coordinates but missing ZIP.
 *
 * Usage:
 *   npx tsx scripts/backfill-zip-reverse-geocode.ts [--dry-run] [--limit N]
 *
 * Options:
 *   --dry-run    Preview changes without writing to database
 *   --limit N    Process only N stores (for testing)
 *
 * Cost: ~$0.005 per request after free tier (25k/month)
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

// =============================================================================
// Configuration
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

if (!googleApiKey) {
  console.error('Missing NEXT_PUBLIC_GOOGLE_PLACES_API_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Rate limiting: 100ms between requests = 10 req/sec
const DELAY_MS = 100

// =============================================================================
// Types
// =============================================================================

interface Store {
  id: number
  name: string
  lat: number
  lng: number
  zip: string | null
}

interface GeocodeResponse {
  status: string
  results: Array<{
    address_components: Array<{
      long_name: string
      short_name: string
      types: string[]
    }>
  }>
  error_message?: string
}

// =============================================================================
// Reverse Geocoding
// =============================================================================

/**
 * Call Google Reverse Geocoding API to get address components from lat/lng
 */
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`

  try {
    const response = await fetch(url)
    const data: GeocodeResponse = await response.json()

    if (data.status !== 'OK') {
      if (data.status === 'ZERO_RESULTS') {
        return null // No results for this location
      }
      console.error(`   Geocode error: ${data.status} - ${data.error_message || 'Unknown'}`)
      return null
    }

    // Find postal_code in address_components
    // Check all results (sometimes ZIP is in a different result)
    for (const result of data.results) {
      const zipComponent = result.address_components.find(
        (c) => c.types.includes('postal_code')
      )
      if (zipComponent) {
        return zipComponent.short_name
      }
    }

    return null // No ZIP found in response
  } catch (error) {
    console.error(`   Fetch error:`, error instanceof Error ? error.message : error)
    return null
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const limitIndex = args.indexOf('--limit')
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : undefined

  console.log('═'.repeat(60))
  console.log('  REVERSE GEOCODE ZIP BACKFILL')
  console.log('═'.repeat(60))
  console.log(`  Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  if (limit) console.log(`  Limit: ${limit} stores`)
  console.log(`  Rate: ${1000 / DELAY_MS} requests/second`)
  console.log('═'.repeat(60))
  console.log()

  // Fetch stores with lat/lng but no ZIP
  console.log('📥 Fetching stores with lat/lng but no ZIP...')

  let query = supabase
    .from('stores')
    .select('id, name, lat, lng, zip')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .is('zip', null)
    .order('id')

  if (limit) {
    query = query.limit(limit)
  }

  const { data: stores, error } = await query

  if (error) {
    console.error('Error fetching stores:', error)
    process.exit(1)
  }

  console.log(`   Found ${stores?.length ?? 0} stores to process`)
  console.log()

  if (!stores || stores.length === 0) {
    console.log('✅ No stores need updating')
    return
  }

  // Process each store
  let updated = 0
  let noZipFound = 0
  let errors = 0

  const startTime = Date.now()

  for (let i = 0; i < stores.length; i++) {
    const store = stores[i] as Store
    const progress = `[${i + 1}/${stores.length}]`

    // Call reverse geocoding API
    const zip = await reverseGeocode(store.lat, store.lng)

    if (!zip) {
      noZipFound++
      if (dryRun) {
        console.log(`   ${progress} ${store.name}: No ZIP found`)
      }
      await sleep(DELAY_MS)
      continue
    }

    if (dryRun) {
      console.log(`   ${progress} ${store.name}: ${zip}`)
      updated++
      await sleep(DELAY_MS)
      continue
    }

    // Update the store
    const { error: updateError } = await supabase
      .from('stores')
      .update({ zip })
      .eq('id', store.id)

    if (updateError) {
      console.error(`   ${progress} ERROR ${store.name}:`, updateError.message)
      errors++
      await sleep(DELAY_MS)
      continue
    }

    console.log(`   ${progress} ✓ ${store.name}: ${zip}`)
    updated++

    // Rate limiting delay
    await sleep(DELAY_MS)
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  // Summary
  console.log()
  console.log('═'.repeat(60))
  console.log('  RESULTS')
  console.log('═'.repeat(60))
  console.log(`  Total processed:   ${stores.length}`)
  console.log(`  ZIP found:         ${updated}`)
  console.log(`  No ZIP found:      ${noZipFound}`)
  console.log(`  Errors:            ${errors}`)
  console.log(`  Time elapsed:      ${elapsed}s`)
  console.log('═'.repeat(60))

  if (dryRun && updated > 0) {
    console.log()
    console.log('💡 Run without --dry-run to apply changes')
  }

  // Success rate
  const successRate = ((updated / stores.length) * 100).toFixed(1)
  console.log()
  console.log(`📊 Success rate: ${successRate}%`)
}

main().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
