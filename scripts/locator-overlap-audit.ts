#!/usr/bin/env npx tsx
/**
 * Locator CSV Overlap Audit
 *
 * Three-way comparison of ~9,479 scraped listings from scratchanddentlocator.com
 * against existing DB stores AND the nearme CSV (~9,849 rows).
 *
 * Read-only — no DB writes.
 *
 * Usage:
 *   npx tsx scripts/locator-overlap-audit.ts [--export]
 *
 * Options:
 *   --export    Write match/net-new CSVs to /tmp/locator-audit/
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fs from 'node:fs'
import path from 'node:path'
import { hashAddress, normalizePhone } from '../lib/utils/address-normalizer'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
}

interface DbStore {
  id: number
  name: string
  address: string
  phone: string | null
  phone_normalized: string | null
  address_hash: string | null
  google_place_id: string | null
  is_archived: boolean | null
  city: { name: string } | null
  state: { name: string } | null
}

// ---------------------------------------------------------------------------
// CSV Parser (handles quoted fields with commas)
// ---------------------------------------------------------------------------

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
          i++ // skip escaped quote
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

// ---------------------------------------------------------------------------
// Fetch DB stores with pagination
// ---------------------------------------------------------------------------

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
        google_place_id,
        is_archived,
        city:cities(name),
        state:states(name)
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

// ---------------------------------------------------------------------------
// Escape CSV field
// ---------------------------------------------------------------------------

function csvField(val: string | null | undefined): string {
  if (!val) return ''
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const shouldExport = process.argv.includes('--export')

  const locatorPath = '/Volumes/KINGSTON/stores_20260204_103654.csv'
  if (!fs.existsSync(locatorPath)) {
    console.error(`Locator CSV not found: ${locatorPath}`)
    process.exit(1)
  }

  const nearmePath = path.resolve(process.env.HOME || '~', 'scratch_and_dent_stores.csv')
  if (!fs.existsSync(nearmePath)) {
    console.error(`Nearme CSV not found: ${nearmePath}`)
    process.exit(1)
  }

  console.log('='.repeat(60))
  console.log('LOCATOR CSV OVERLAP AUDIT (3-way)')
  console.log('='.repeat(60))
  console.log('')

  // ── Step 1: Parse locator CSV ───────────────────────────────────────
  console.log('Parsing locator CSV...')
  const locatorRows = parseCSV<LocatorRow>(locatorPath)
  console.log(`  Parsed ${locatorRows.length.toLocaleString()} rows`)

  // Compute keys for each locator row
  const locatorKeyed = locatorRows.map((row) => {
    const fullAddress = `${row.street_address}, ${row.city}, ${row.state} ${row.zip_code}`
    return {
      row,
      address_hash: hashAddress(fullAddress),
      phone_normalized: normalizePhone(row.phone),
      name_city_key: `${row.name.toLowerCase().trim()}|${row.city.toLowerCase().trim()}`,
    }
  })

  // ── Step 2: Parse nearme CSV ────────────────────────────────────────
  console.log('Parsing nearme CSV...')
  const nearmeRows = parseCSV<NearmeRow>(nearmePath)
  console.log(`  Parsed ${nearmeRows.length.toLocaleString()} rows`)

  // Build nearme lookup maps (address hash + phone)
  const nearmeAddressHashes = new Set<string>()
  const nearmePhones = new Set<string>()

  for (const row of nearmeRows) {
    const fullAddress = `${row.street}, ${row.city_addr}, ${row.state_addr} ${row.zip}`
    const hash = hashAddress(fullAddress)
    if (hash) nearmeAddressHashes.add(hash)

    const phone = normalizePhone(row.phone)
    if (phone) nearmePhones.add(phone)
  }

  console.log(`  Nearme unique address hashes: ${nearmeAddressHashes.size.toLocaleString()}`)
  console.log(`  Nearme unique phones: ${nearmePhones.size.toLocaleString()}`)
  console.log('')

  // ── Step 3: Fetch DB stores ─────────────────────────────────────────
  console.log('Fetching DB stores...')
  const { supabaseAdmin } = await import('../lib/supabase/admin')
  const dbStores = await fetchAllStores(supabaseAdmin)
  console.log(`  Fetched ${dbStores.length.toLocaleString()} active stores\n`)

  // ── Step 4: Build DB lookup maps ────────────────────────────────────
  let dbWithHash = 0
  let dbComputedHash = 0
  const dbAddressHashes = new Map<string, DbStore[]>()

  for (const store of dbStores) {
    let hash = store.address_hash
    if (hash) {
      dbWithHash++
    } else if (store.address) {
      hash = hashAddress(store.address)
      dbComputedHash++
    }
    if (hash) {
      const arr = dbAddressHashes.get(hash) || []
      arr.push(store)
      dbAddressHashes.set(hash, arr)
    }
  }

  // Phone
  const dbPhones = new Map<string, DbStore[]>()
  for (const store of dbStores) {
    const phone = store.phone_normalized || normalizePhone(store.phone)
    if (phone) {
      const arr = dbPhones.get(phone) || []
      arr.push(store)
      dbPhones.set(phone, arr)
    }
  }

  // Name + City
  const dbNameCity = new Map<string, DbStore[]>()
  for (const store of dbStores) {
    const cityName = store.city?.name || ''
    const key = `${store.name.toLowerCase().trim()}|${cityName.toLowerCase().trim()}`
    const arr = dbNameCity.get(key) || []
    arr.push(store)
    dbNameCity.set(key, arr)
  }

  console.log(`  DB stores with address_hash in DB: ${dbWithHash.toLocaleString()}`)
  console.log(`  DB stores with hash computed in-memory: ${dbComputedHash.toLocaleString()}`)
  console.log(`  Unique DB address hashes: ${dbAddressHashes.size.toLocaleString()}`)
  console.log(`  Unique DB phones: ${dbPhones.size.toLocaleString()}`)
  console.log('')

  // ── Step 5: Match locator against DB ────────────────────────────────
  console.log('Matching locator against DB...')

  const matchedDbByAddress: typeof locatorKeyed = []
  const matchedDbByPhone: typeof locatorKeyed = []
  const matchedDbByNameCity: typeof locatorKeyed = []
  const matchedDbAny = new Set<number>() // index into locatorKeyed

  for (let i = 0; i < locatorKeyed.length; i++) {
    const entry = locatorKeyed[i]

    // Strategy A: Address hash
    if (entry.address_hash && dbAddressHashes.has(entry.address_hash)) {
      matchedDbByAddress.push(entry)
      matchedDbAny.add(i)
      continue
    }

    // Strategy B: Phone
    if (entry.phone_normalized && dbPhones.has(entry.phone_normalized)) {
      matchedDbByPhone.push(entry)
      matchedDbAny.add(i)
      continue
    }

    // Strategy C: Name + City (soft)
    if (dbNameCity.has(entry.name_city_key)) {
      matchedDbByNameCity.push(entry)
      matchedDbAny.add(i)
    }
  }

  // ── Step 6: Match locator against nearme ────────────────────────────
  console.log('Matching locator against nearme...')

  const matchedNearme: typeof locatorKeyed = []
  const matchedNearmeIdx = new Set<number>()

  for (let i = 0; i < locatorKeyed.length; i++) {
    const entry = locatorKeyed[i]

    // Address hash match
    if (entry.address_hash && nearmeAddressHashes.has(entry.address_hash)) {
      matchedNearme.push(entry)
      matchedNearmeIdx.add(i)
      continue
    }

    // Phone match
    if (entry.phone_normalized && nearmePhones.has(entry.phone_normalized)) {
      matchedNearme.push(entry)
      matchedNearmeIdx.add(i)
    }
  }

  // ── Step 7: Net new (no match against DB or nearme) ─────────────────
  const netNew = locatorKeyed.filter((_, i) => !matchedDbAny.has(i) && !matchedNearmeIdx.has(i))

  // Rows that matched nearme but NOT DB (potential imports from locator that nearme already found)
  const nearmeOnlyOverlap = locatorKeyed.filter((_, i) => !matchedDbAny.has(i) && matchedNearmeIdx.has(i))

  // ── Step 8: Geographic breakdown of net-new ─────────────────────────
  const netNewByState = new Map<string, number>()
  for (const entry of netNew) {
    const st = entry.row.state || 'Unknown'
    netNewByState.set(st, (netNewByState.get(st) || 0) + 1)
  }
  const sortedStates = [...netNewByState.entries()].sort((a, b) => b[1] - a[1])

  // States in DB
  const dbStates = new Set<string>()
  for (const store of dbStores) {
    if (store.state?.name) dbStates.add(store.state.name)
  }
  // Locator states with no DB presence
  const locatorStates = new Set(locatorRows.map((r) => r.state).filter(Boolean))
  const newCoverageStates = [...locatorStates].filter((s) => !dbStates.has(s)).sort()

  // ── Report ──────────────────────────────────────────────────────────
  console.log('')
  console.log('='.repeat(60))
  console.log('LOCATOR CSV OVERLAP AUDIT (3-way)')
  console.log('='.repeat(60))
  console.log(`Locator CSV rows:               ${locatorRows.length.toLocaleString()}`)
  console.log(`Nearme CSV rows:                ${nearmeRows.length.toLocaleString()}`)
  console.log(`DB stores (active):             ${dbStores.length.toLocaleString()}`)
  console.log(`DB stores with address_hash:    ${dbWithHash.toLocaleString()}  (${dbComputedHash.toLocaleString()} computed in-memory)`)
  console.log('')
  console.log('LOCATOR ↔ DB MATCHING')
  console.log('─'.repeat(60))
  console.log(`Address hash matches:           ${matchedDbByAddress.length.toLocaleString()}  (strong — same address)`)
  console.log(`Phone matches:                  ${matchedDbByPhone.length.toLocaleString()}  (strong — same phone, different address)`)
  console.log(`Name+city matches:              ${matchedDbByNameCity.length.toLocaleString()}  (soft — needs review)`)
  console.log(`Combined DB matches:            ${matchedDbAny.size.toLocaleString()}`)
  console.log('')
  console.log('LOCATOR ↔ NEARME MATCHING')
  console.log('─'.repeat(60))
  console.log(`Nearme matches (addr or phone): ${matchedNearme.length.toLocaleString()}`)
  console.log(`  Of which also in DB:          ${locatorKeyed.filter((_, i) => matchedDbAny.has(i) && matchedNearmeIdx.has(i)).length.toLocaleString()}`)
  console.log(`  Of which nearme-only:         ${nearmeOnlyOverlap.length.toLocaleString()}  (in nearme but not DB)`)
  console.log('')
  console.log('SUMMARY')
  console.log('─'.repeat(60))
  console.log(`Matched DB:                     ${matchedDbAny.size.toLocaleString()}`)
  console.log(`Matched nearme (not DB):        ${nearmeOnlyOverlap.length.toLocaleString()}`)
  console.log(`Net new (no match anywhere):    ${netNew.length.toLocaleString()}`)
  console.log('')
  console.log('GEOGRAPHIC BREAKDOWN (net new)')
  console.log('─'.repeat(60))
  console.log('States with most new stores:')
  for (const [state, count] of sortedStates.slice(0, 15)) {
    console.log(`  ${state.padEnd(22)} ${count.toLocaleString()}`)
  }
  if (sortedStates.length > 15) {
    console.log(`  ... and ${sortedStates.length - 15} more states`)
  }
  console.log('')
  if (newCoverageStates.length > 0) {
    console.log('States with NO existing DB stores that would gain coverage:')
    console.log(`  ${newCoverageStates.join(', ')}`)
  } else {
    console.log('All locator states already have DB coverage.')
  }
  console.log('='.repeat(60))

  // ── Export CSVs ─────────────────────────────────────────────────────
  if (shouldExport) {
    const exportDir = '/tmp/locator-audit'
    fs.mkdirSync(exportDir, { recursive: true })

    const header = 'name,street_address,city,state,zip_code,phone,latitude,longitude,address_hash,phone_normalized'

    function rowToCsv(entry: (typeof locatorKeyed)[0]): string {
      const r = entry.row
      return [
        csvField(r.name),
        csvField(r.street_address),
        csvField(r.city),
        csvField(r.state),
        csvField(r.zip_code),
        csvField(r.phone),
        csvField(r.latitude),
        csvField(r.longitude),
        csvField(entry.address_hash),
        csvField(entry.phone_normalized),
      ].join(',')
    }

    // Matched DB by address
    const addrCsv = [header, ...matchedDbByAddress.map(rowToCsv)].join('\n')
    fs.writeFileSync(path.join(exportDir, 'matched-db-address.csv'), addrCsv)

    // Matched DB by phone only
    const phoneCsv = [header, ...matchedDbByPhone.map(rowToCsv)].join('\n')
    fs.writeFileSync(path.join(exportDir, 'matched-db-phone.csv'), phoneCsv)

    // Matched DB by name+city
    const ncCsv = [header, ...matchedDbByNameCity.map(rowToCsv)].join('\n')
    fs.writeFileSync(path.join(exportDir, 'matched-db-name-city.csv'), ncCsv)

    // Matched nearme
    const nearmeCsv = [header, ...matchedNearme.map(rowToCsv)].join('\n')
    fs.writeFileSync(path.join(exportDir, 'matched-nearme.csv'), nearmeCsv)

    // Net new
    const newCsv = [header, ...netNew.map(rowToCsv)].join('\n')
    fs.writeFileSync(path.join(exportDir, 'net-new.csv'), newCsv)

    console.log(`\nExported to ${exportDir}/`)
    console.log(`  matched-db-address.csv   (${matchedDbByAddress.length.toLocaleString()} rows)`)
    console.log(`  matched-db-phone.csv     (${matchedDbByPhone.length.toLocaleString()} rows)`)
    console.log(`  matched-db-name-city.csv (${matchedDbByNameCity.length.toLocaleString()} rows)`)
    console.log(`  matched-nearme.csv       (${matchedNearme.length.toLocaleString()} rows)`)
    console.log(`  net-new.csv              (${netNew.length.toLocaleString()} rows)`)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
