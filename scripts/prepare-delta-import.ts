#!/usr/bin/env npx tsx
/**
 * Prepare Delta Import
 *
 * Analyzes a canonical.json file BEFORE import to show what would be imported.
 * READ-ONLY - no database writes.
 *
 * Usage:
 *   npx tsx scripts/prepare-delta-import.ts --file <path> [--confidence 0.90]
 *
 * Options:
 *   --file         Path to canonical.json file
 *   --confidence   Minimum confidence threshold (default: 0.85)
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fs from 'node:fs'

// =============================================================================
// Types
// =============================================================================

interface CanonicalPlace {
  name: string
  address: string
  city: string
  state: string
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

// =============================================================================
// State Name → Code Mapping
// =============================================================================

const STATE_NAME_TO_CODE: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY',
}

function normalizeStateCode(state: string): string | null {
  if (!state) return null
  if (state.length === 2) return state.toUpperCase()
  return STATE_NAME_TO_CODE[state] || null
}

// =============================================================================
// Validation
// =============================================================================

function validatePlace(place: CanonicalPlace): { valid: boolean; reason?: string } {
  if (!place.external_ids?.google_place_id) {
    return { valid: false, reason: 'missing_google_place_id' }
  }
  if (!place.name?.trim()) {
    return { valid: false, reason: 'missing_name' }
  }
  if (!place.address?.trim()) {
    return { valid: false, reason: 'missing_address' }
  }
  if (!place.state?.trim()) {
    return { valid: false, reason: 'missing_state' }
  }
  if (!place.city?.trim()) {
    return { valid: false, reason: 'missing_city' }
  }
  const stateCode = normalizeStateCode(place.state)
  if (!stateCode) {
    return { valid: false, reason: 'unknown_state' }
  }
  return { valid: true }
}

// =============================================================================
// CLI
// =============================================================================

function parseArgs() {
  const args = process.argv.slice(2)
  let filePath = ''
  let confidenceThreshold = 0.85

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
        filePath = args[++i]
        break
      case '--confidence':
        confidenceThreshold = parseFloat(args[++i])
        break
    }
  }

  return { filePath, confidenceThreshold }
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const { filePath, confidenceThreshold } = parseArgs()

  console.log('═'.repeat(60))
  console.log('  DELTA IMPORT ANALYSIS')
  console.log('═'.repeat(60))

  if (!filePath) {
    console.error('Error: --file is required')
    console.error('Usage: npx tsx scripts/prepare-delta-import.ts --file <path> [--confidence 0.90]')
    process.exit(1)
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`)
    process.exit(1)
  }

  console.log(`  Source file: ${filePath}`)
  console.log(`  Confidence threshold: ${confidenceThreshold}`)
  console.log('═'.repeat(60))
  console.log('')

  // Load file
  console.log('Loading canonical.json...')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const places: CanonicalPlace[] = JSON.parse(raw)

  console.log(`Total records in file: ${places.length}`)

  // Filter by confidence
  const eligible = places.filter(p => p.confidence >= confidenceThreshold)
  console.log(`Meet confidence threshold (≥${confidenceThreshold}): ${eligible.length}`)
  console.log('')

  // Validate records
  console.log('─'.repeat(60))
  console.log('VALIDATION')
  console.log('─'.repeat(60))

  const validationFailures: Record<string, number> = {}
  const validPlaces: CanonicalPlace[] = []

  for (const place of eligible) {
    const result = validatePlace(place)
    if (result.valid) {
      validPlaces.push(place)
    } else {
      const reason = result.reason || 'unknown'
      validationFailures[reason] = (validationFailures[reason] || 0) + 1
    }
  }

  console.log(`Valid records: ${validPlaces.length}`)
  if (Object.keys(validationFailures).length > 0) {
    console.log('Validation failures:')
    for (const [reason, count] of Object.entries(validationFailures)) {
      console.log(`  ${reason}: ${count}`)
    }
  }
  console.log('')

  // Check against database for duplicates
  console.log('─'.repeat(60))
  console.log('DEDUP CHECK AGAINST DATABASE')
  console.log('─'.repeat(60))

  const { supabaseAdmin } = await import('../lib/supabase/admin')

  // Fetch all existing google_place_ids
  console.log('Fetching existing google_place_ids...')
  const PAGE_SIZE = 1000
  const existingPlaceIds = new Set<string>()
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from('stores')
      .select('google_place_id')
      .not('google_place_id', 'is', null)
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.error('Failed to fetch stores:', error.message)
      process.exit(1)
    }

    if (data && data.length > 0) {
      for (const store of data) {
        if (store.google_place_id) {
          existingPlaceIds.add(store.google_place_id)
        }
      }
      offset += PAGE_SIZE
      hasMore = data.length === PAGE_SIZE
    } else {
      hasMore = false
    }
  }

  console.log(`Existing stores with google_place_id: ${existingPlaceIds.size}`)

  // Check which places are new vs existing
  const newPlaces: CanonicalPlace[] = []
  const existingCount = { count: 0 }

  for (const place of validPlaces) {
    if (existingPlaceIds.has(place.external_ids.google_place_id)) {
      existingCount.count++
    } else {
      newPlaces.push(place)
    }
  }

  console.log(`Already exists (would skip): ${existingCount.count}`)
  console.log(`Would be NEW inserts: ${newPlaces.length}`)
  console.log('')

  // Geographic distribution
  console.log('─'.repeat(60))
  console.log('GEOGRAPHIC DISTRIBUTION (New Records)')
  console.log('─'.repeat(60))

  const stateDistribution: Record<string, number> = {}
  const cityDistribution: Record<string, Record<string, number>> = {}

  for (const place of newPlaces) {
    const stateCode = normalizeStateCode(place.state) || 'UNKNOWN'
    stateDistribution[stateCode] = (stateDistribution[stateCode] || 0) + 1

    if (!cityDistribution[stateCode]) {
      cityDistribution[stateCode] = {}
    }
    const city = place.city || 'Unknown'
    cityDistribution[stateCode][city] = (cityDistribution[stateCode][city] || 0) + 1
  }

  // Sort by count descending
  const sortedStates = Object.entries(stateDistribution).sort((a, b) => b[1] - a[1])

  for (const [state, count] of sortedStates) {
    const cities = Object.entries(cityDistribution[state] || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city, c]) => `${city}: ${c}`)
      .join(', ')
    console.log(`  ${state}: ${count} (${cities})`)
  }
  console.log('')

  // Summary
  console.log('═'.repeat(60))
  console.log('  SUMMARY')
  console.log('═'.repeat(60))
  console.log(`  Total records in file:     ${places.length}`)
  console.log(`  Meet confidence threshold: ${eligible.length}`)
  console.log(`  Pass validation:           ${validPlaces.length}`)
  console.log(`  Already exist (skip):      ${existingCount.count}`)
  console.log(`  ELIGIBLE FOR IMPORT:       ${newPlaces.length}`)
  console.log('═'.repeat(60))
  console.log('')
  console.log('This is a READ-ONLY analysis. No changes were made.')
  console.log('Use import-canonical.ts to perform the actual import.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
