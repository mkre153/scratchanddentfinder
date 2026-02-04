#!/usr/bin/env npx tsx
/**
 * Import Nearme CSV into Database
 *
 * Imports scraped listings from scratchanddentnearme.com, enriching each row
 * with the real website URL from the locator CSV when available.
 * Skips rows already in DB (by address hash, phone, or name+city).
 *
 * Usage:
 *   npx tsx scripts/import-nearme.ts --batch-id <id> [--dry-run] [--limit 10]
 *
 * Options:
 *   --batch-id     Batch identifier for rollback (required, e.g., nearme-2026-02)
 *   --dry-run      Preview without writing to database
 *   --limit <n>    Maximum records to import (default: 0 = no limit)
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fs from 'node:fs'
import path from 'node:path'
import {
  hashAddress,
  normalizePhone,
  normalizeBusinessName,
} from '../lib/utils/address-normalizer'

// =============================================================================
// Types
// =============================================================================

interface NearmeRow {
  source: string
  state: string
  city: string
  name: string
  street: string
  city_addr: string
  state_addr: string
  zip: string
  phone: string
  website: string
  latitude: string
  longitude: string
  hours_mon: string
  hours_tue: string
  hours_wed: string
  hours_thu: string
  hours_fri: string
  hours_sat: string
  hours_sun: string
  refrigerators: string
  washers_dryers: string
  dishwashers: string
  stoves_ranges: string
  delivery: string
  installation: string
}

interface LocatorRow {
  id: string
  name: string
  street_address: string
  city: string
  state: string
  zip_code: string
  phone: string
  website: string
  latitude: string
  longitude: string
  hours: string
  appliances: string
  source_url: string
  scraped_at: string
}

interface DbStore {
  id: number
  name: string
  address: string
  phone: string | null
  phone_normalized: string | null
  address_hash: string | null
  is_archived: boolean | null
  city: { name: string } | null
}

interface ImportOptions {
  batchId: string
  dryRun: boolean
  limit: number
}

interface ImportStats {
  total: number
  skippedDedup: number
  skippedValidation: number
  inserted: number
  errors: number
  websiteEnriched: number
}

interface DedupBreakdown {
  addressHash: number
  phone: number
  nameCity: number
}

// =============================================================================
// CSV Parser (handles quoted fields with commas)
// =============================================================================

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        fields.push(current)
        current = ''
      } else {
        current += char
      }
    }
  }
  fields.push(current)
  return fields
}

function parseCSV<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const rows: T[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || ''
    }
    rows.push(row as unknown as T)
  }

  return rows
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

// Reverse: code → name (for slug generation)
const STATE_CODE_TO_NAME: Record<string, string> = {}
for (const [name, code] of Object.entries(STATE_NAME_TO_CODE)) {
  STATE_CODE_TO_NAME[code] = name
}

function resolveStateCode(stateAddr: string, stateFull: string): string | null {
  // Prefer state_addr (2-letter code)
  if (stateAddr && stateAddr.length === 2) {
    const upper = stateAddr.toUpperCase()
    if (STATE_CODE_TO_NAME[upper]) return upper
  }
  // Fall back to state (full name from page)
  if (stateFull) {
    const code = STATE_NAME_TO_CODE[stateFull]
    if (code) return code
  }
  return null
}

function stateCodeToSlug(code: string): string {
  const name = STATE_CODE_TO_NAME[code]
  if (!name) throw new Error(`Unknown state code: ${code}`)
  return name.toLowerCase().replace(/\s+/g, '-')
}

// =============================================================================
// Hours Parsing
// =============================================================================

function buildHoursJson(row: NearmeRow): Record<string, string> | null {
  const days: Record<string, string> = {}
  const mapping: [string, string][] = [
    ['mon', row.hours_mon],
    ['tue', row.hours_tue],
    ['wed', row.hours_wed],
    ['thu', row.hours_thu],
    ['fri', row.hours_fri],
    ['sat', row.hours_sat],
    ['sun', row.hours_sun],
  ]

  let hasAny = false
  for (const [day, val] of mapping) {
    if (val && val.trim()) {
      days[day] = val.trim()
      hasAny = true
    }
  }

  return hasAny ? days : null
}

// =============================================================================
// Fetch DB Stores (paginated)
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllStores(supabaseAdmin: any): Promise<DbStore[]> {
  const PAGE_SIZE = 1000
  const stores: DbStore[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from('stores')
      .select(`
        id,
        name,
        address,
        phone,
        phone_normalized,
        address_hash,
        is_archived,
        city:cities(name)
      `)
      .or('is_archived.is.null,is_archived.eq.false')
      .order('id')
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.error('Failed to fetch stores:', error.message)
      process.exit(1)
    }

    if (data && data.length > 0) {
      stores.push(...(data as unknown as DbStore[]))
      offset += PAGE_SIZE
      hasMore = data.length === PAGE_SIZE
    } else {
      hasMore = false
    }
  }

  return stores
}

// =============================================================================
// CLI
// =============================================================================

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2)

  let batchId = ''
  let dryRun = false
  let limit = 0

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--batch-id':
        batchId = args[++i]
        break
      case '--dry-run':
        dryRun = true
        break
      case '--limit':
        limit = parseInt(args[++i], 10)
        break
      case '--help':
        console.log(`
Usage: npx tsx scripts/import-nearme.ts [options]

Options:
  --batch-id <id>     Batch identifier for rollback (required)
  --dry-run           Preview without writing to database
  --limit <n>         Maximum records to import (default: 0 = no limit)
  --help              Show this help message
`)
        process.exit(0)
    }
  }

  if (!batchId) {
    console.error('Error: --batch-id is required')
    process.exit(1)
  }

  return { batchId, dryRun, limit }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  const options = parseArgs()

  const nearmeCSVPath = path.resolve(process.env.HOME || '~', 'scratch_and_dent_stores.csv')
  const locatorCSVPath = '/Volumes/KINGSTON/stores_20260204_103654.csv'

  console.log('='.repeat(60))
  console.log('  IMPORT NEARME CSV')
  console.log('='.repeat(60))
  console.log(`  Batch ID:  ${options.batchId}`)
  console.log(`  Limit:     ${options.limit > 0 ? options.limit : 'none'}`)
  console.log(`  Mode:      ${options.dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log('='.repeat(60))
  console.log()

  // ── Step 1: Parse nearme CSV ──────────────────────────────────────────
  if (!fs.existsSync(nearmeCSVPath)) {
    console.error(`Nearme CSV not found: ${nearmeCSVPath}`)
    process.exit(1)
  }
  console.log('Parsing nearme CSV...')
  const nearmeRows = parseCSV<NearmeRow>(nearmeCSVPath)
  console.log(`  ${nearmeRows.length.toLocaleString()} rows`)

  // ── Step 2: Parse locator CSV → build lookup maps ─────────────────────
  const locatorByAddressHash = new Map<string, LocatorRow>()
  const locatorByPhone = new Map<string, LocatorRow>()

  if (fs.existsSync(locatorCSVPath)) {
    console.log('Parsing locator CSV for website enrichment...')
    const locatorRows = parseCSV<LocatorRow>(locatorCSVPath)
    console.log(`  ${locatorRows.length.toLocaleString()} rows`)

    for (const row of locatorRows) {
      // Build address string matching nearme format for hashing
      const fullAddress = `${row.street_address}, ${row.city}, ${row.state} ${row.zip_code}`
      const hash = hashAddress(fullAddress)
      if (hash) locatorByAddressHash.set(hash, row)

      const phone = normalizePhone(row.phone)
      if (phone) locatorByPhone.set(phone, row)
    }
    console.log(`  Locator lookup: ${locatorByAddressHash.size} by address hash, ${locatorByPhone.size} by phone`)
  } else {
    console.log(`  Locator CSV not found at ${locatorCSVPath} — skipping website enrichment`)
  }
  console.log()

  // ── Step 3: Fetch DB stores → build dedup maps ────────────────────────
  console.log('Fetching DB stores...')
  const { supabaseAdmin } = await import('../lib/supabase/admin')
  const dbStores = await fetchAllStores(supabaseAdmin)
  console.log(`  ${dbStores.length.toLocaleString()} active stores`)

  // Address hash map
  const dbAddressHashes = new Set<string>()
  for (const store of dbStores) {
    let hash = store.address_hash
    if (!hash && store.address) {
      hash = hashAddress(store.address)
    }
    if (hash) dbAddressHashes.add(hash)
  }

  // Phone map
  const dbPhones = new Set<string>()
  for (const store of dbStores) {
    const phone = store.phone_normalized || normalizePhone(store.phone)
    if (phone) dbPhones.add(phone)
  }

  // Name+city map
  const dbNameCity = new Set<string>()
  for (const store of dbStores) {
    const cityName = store.city?.name || ''
    const key = `${normalizeBusinessName(store.name)}|${cityName.toLowerCase().trim()}`
    dbNameCity.add(key)
  }

  console.log(`  Dedup maps: ${dbAddressHashes.size} address hashes, ${dbPhones.size} phones, ${dbNameCity.size} name+city`)
  console.log()

  // ── Step 4: Load DB helpers ───────────────────────────────────────────
  const { ensureCity, logIngestion } = await import('../lib/ingestion')

  // Pre-fetch states table
  const { data: statesData, error: statesError } = await supabaseAdmin
    .from('states')
    .select('id, slug, name')

  if (statesError) {
    console.error('Failed to fetch states:', statesError.message)
    process.exit(1)
  }

  const statesBySlug = new Map<string, { id: number; slug: string; name: string }>()
  for (const s of statesData || []) {
    statesBySlug.set(s.slug, s)
  }

  // ── Step 5: Process rows ──────────────────────────────────────────────
  const stats: ImportStats = {
    total: nearmeRows.length,
    skippedDedup: 0,
    skippedValidation: 0,
    inserted: 0,
    errors: 0,
    websiteEnriched: 0,
  }

  const dedupBreakdown: DedupBreakdown = {
    addressHash: 0,
    phone: 0,
    nameCity: 0,
  }

  // Apply limit
  const rowsToProcess = options.limit > 0 ? nearmeRows.slice(0, options.limit) : nearmeRows

  console.log(`Processing ${rowsToProcess.length.toLocaleString()} rows...`)
  if (options.dryRun) console.log('(DRY RUN — no DB writes)')
  console.log()

  for (let i = 0; i < rowsToProcess.length; i++) {
    const row = rowsToProcess[i]

    try {
      // ── Compute keys ────────────────────────────────────────────────
      const fullAddress = `${row.street}, ${row.city_addr}, ${row.state_addr} ${row.zip}`
      const addressHash = hashAddress(fullAddress)
      const phoneNormalized = normalizePhone(row.phone)
      const nameCityKey = `${normalizeBusinessName(row.name)}|${row.city_addr.toLowerCase().trim()}`

      // ── Dedup check ─────────────────────────────────────────────────
      if (addressHash && dbAddressHashes.has(addressHash)) {
        dedupBreakdown.addressHash++
        stats.skippedDedup++
        continue
      }
      if (phoneNormalized && dbPhones.has(phoneNormalized)) {
        dedupBreakdown.phone++
        stats.skippedDedup++
        continue
      }
      if (dbNameCity.has(nameCityKey)) {
        dedupBreakdown.nameCity++
        stats.skippedDedup++
        continue
      }

      // ── Validate required fields ────────────────────────────────────
      if (!row.name?.trim()) {
        stats.skippedValidation++
        continue
      }
      if (!row.street?.trim()) {
        stats.skippedValidation++
        continue
      }
      if (!row.city_addr?.trim()) {
        stats.skippedValidation++
        continue
      }

      const stateCode = resolveStateCode(row.state_addr, row.state)
      if (!stateCode) {
        stats.skippedValidation++
        continue
      }

      // ── Resolve state ───────────────────────────────────────────────
      const stateSlug = stateCodeToSlug(stateCode)
      const stateRow = statesBySlug.get(stateSlug)
      if (!stateRow) {
        console.error(`  ERROR: State not in DB: ${stateSlug} (row: ${row.name})`)
        stats.errors++
        continue
      }

      // ── Website enrichment from locator ─────────────────────────────
      let website: string | null = null
      const locatorMatch = (addressHash && locatorByAddressHash.get(addressHash)) ||
        (phoneNormalized && locatorByPhone.get(phoneNormalized)) ||
        null
      if (locatorMatch?.website) {
        website = locatorMatch.website
        stats.websiteEnriched++
      }

      // ── Build place_id ──────────────────────────────────────────────
      if (!addressHash) {
        console.error(`  ERROR: Empty address hash for ${row.name}`)
        stats.errors++
        continue
      }
      const placeId = `nearme_${addressHash}`

      // ── Build slug ──────────────────────────────────────────────────
      const slug = `${row.name}-${row.city_addr}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // ── Build full address string ───────────────────────────────────
      const addressStr = `${row.street}, ${row.city_addr}, ${stateCode} ${row.zip}`.trim()

      // ── Parse coordinates ───────────────────────────────────────────
      const lat = row.latitude ? parseFloat(row.latitude) : null
      const lng = row.longitude ? parseFloat(row.longitude) : null

      // ── Build hours JSONB ───────────────────────────────────────────
      const hours = buildHoursJson(row)

      // ── Build appliances array ──────────────────────────────────────
      const appliances: string[] = []
      if (row.refrigerators === 'Yes') appliances.push('Refrigerators')
      if (row.washers_dryers === 'Yes') appliances.push('Washers and Dryers')
      if (row.dishwashers === 'Yes') appliances.push('Dishwashers')
      if (row.stoves_ranges === 'Yes') appliances.push('Stoves and Ranges')

      // ── Build services array ────────────────────────────────────────
      const services: string[] = []
      if (row.delivery === 'Yes') services.push('Delivery')
      if (row.installation === 'Yes') services.push('Installation')

      if (options.dryRun) {
        console.log(`  INSERT: ${row.name} (${row.city_addr}, ${stateCode})${website ? ' [+website]' : ''}`)
        stats.inserted++

        // Add to dedup sets so subsequent rows in this batch dedup against each other
        if (addressHash) dbAddressHashes.add(addressHash)
        if (phoneNormalized) dbPhones.add(phoneNormalized)
        dbNameCity.add(nameCityKey)
        continue
      }

      // ── Ensure city ─────────────────────────────────────────────────
      const city = await ensureCity(
        stateRow.id,
        stateCode,
        row.city_addr.trim(),
        lat,
        lng
      )

      // ── Insert store ────────────────────────────────────────────────
      const now = new Date().toISOString()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabaseAdmin as any)
        .from('stores')
        .insert({
          place_id: placeId,
          user_id: null,
          name: row.name.trim(),
          slug,
          address: addressStr,
          city_id: city.id,
          state_id: stateRow.id,
          zip: row.zip || null,
          phone: row.phone || null,
          website,
          description: null,
          hours,
          appliances: appliances.length > 0 ? appliances : null,
          services: services.length > 0 ? services : null,
          rating: null,
          review_count: null,
          is_featured: false,
          featured_tier: null,
          featured_until: null,
          lat,
          lng,
          is_approved: true,
          is_verified: true,
          claimed_by: null,
          claimed_at: null,
          source: 'nearme',
          batch_id: options.batchId,
          google_place_id: null,
          ingested_at: now,
          address_hash: addressHash,
          phone_normalized: phoneNormalized,
        })

      if (error) {
        let message = error.message
        if (error.details) message += ` | ${error.details}`
        if (error.code) message += ` | ${error.code}`
        console.error(`  ERROR: ${row.name} - ${message}`)
        stats.errors++
        continue
      }

      console.log(`  INSERT: ${row.name} (${row.city_addr}, ${stateCode})${website ? ' [+website]' : ''}`)
      stats.inserted++

      // Add to dedup sets so subsequent rows dedup against each other
      if (addressHash) dbAddressHashes.add(addressHash)
      if (phoneNormalized) dbPhones.add(phoneNormalized)
      dbNameCity.add(nameCityKey)

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`  ERROR: ${row.name || '(unnamed)'} - ${message}`)
      stats.errors++
    }
  }

  // ── Log ingestion ───────────────────────────────────────────────────
  if (!options.dryRun && stats.inserted > 0) {
    await logIngestion('csv_import', options.batchId, stats.inserted, 'import-nearme')
  }

  // ── Summary ─────────────────────────────────────────────────────────
  console.log()
  console.log('='.repeat(60))
  console.log('  RESULTS')
  console.log('='.repeat(60))
  console.log(`  Total nearme rows:     ${stats.total.toLocaleString()}`)
  console.log(`  Processed:             ${rowsToProcess.length.toLocaleString()}`)
  console.log(`  Inserted:              ${stats.inserted.toLocaleString()}`)
  console.log(`  Skipped (dedup):       ${stats.skippedDedup.toLocaleString()}`)
  console.log(`    - Address hash:      ${dedupBreakdown.addressHash.toLocaleString()}`)
  console.log(`    - Phone:             ${dedupBreakdown.phone.toLocaleString()}`)
  console.log(`    - Name+city:         ${dedupBreakdown.nameCity.toLocaleString()}`)
  console.log(`  Skipped (validation):  ${stats.skippedValidation.toLocaleString()}`)
  console.log(`  Errors:                ${stats.errors.toLocaleString()}`)
  console.log(`  Website enriched:      ${stats.websiteEnriched.toLocaleString()}`)
  console.log('='.repeat(60))

  if (stats.errors > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
