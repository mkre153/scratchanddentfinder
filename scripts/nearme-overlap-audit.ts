#!/usr/bin/env npx tsx
/**
 * Nearme CSV Overlap Audit
 *
 * Compares ~9,849 scraped listings from scratchanddentnearme.com against
 * existing DB stores to determine overlap before import.
 *
 * Read-only — no DB writes.
 *
 * Usage:
 *   npx tsx scripts/nearme-overlap-audit.ts [--export]
 *
 * Options:
 *   --export    Write match/net-new CSVs to /tmp/nearme-audit/
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fs from 'node:fs'
import path from 'node:path'
import { hashAddress, normalizePhone } from '../lib/utils/address-normalizer'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  // remaining fields not needed for matching
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

function parseCSV(filePath: string): NearmeRow[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const rows: NearmeRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || ''
    }
    rows.push(row as unknown as NearmeRow)
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

  const csvPath = path.resolve(process.env.HOME || '~', 'scratch_and_dent_stores.csv')
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`)
    process.exit(1)
  }

  console.log('='.repeat(60))
  console.log('NEARME CSV OVERLAP AUDIT')
  console.log('='.repeat(60))
  console.log('')

  // ── Step 1: Parse nearme CSV ──────────────────────────────────────────
  console.log('Parsing nearme CSV...')
  const nearmeRows = parseCSV(csvPath)
  console.log(`  Parsed ${nearmeRows.length.toLocaleString()} rows\n`)

  // Compute keys for each nearme row
  const nearmeKeyed = nearmeRows.map((row) => {
    const fullAddress = `${row.street}, ${row.city_addr}, ${row.state_addr} ${row.zip}`
    return {
      row,
      address_hash: hashAddress(fullAddress),
      phone_normalized: normalizePhone(row.phone),
      name_city_key: `${row.name.toLowerCase().trim()}|${row.city_addr.toLowerCase().trim()}`,
    }
  })

  // ── Step 2: Fetch DB stores ───────────────────────────────────────────
  console.log('Fetching DB stores...')
  const { supabaseAdmin } = await import('../lib/supabase/admin')
  const dbStores = await fetchAllStores(supabaseAdmin)
  console.log(`  Fetched ${dbStores.length.toLocaleString()} active stores\n`)

  // ── Step 3: Build DB lookup maps ──────────────────────────────────────
  // Address hash — compute in-memory if missing from DB
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

  // ── Step 4: Match ─────────────────────────────────────────────────────
  console.log('Matching...')

  const matchedByAddress: typeof nearmeKeyed = []
  const matchedByPhone: typeof nearmeKeyed = []
  const matchedByNameCity: typeof nearmeKeyed = []
  const matchedAny = new Set<number>() // index into nearmeKeyed

  for (let i = 0; i < nearmeKeyed.length; i++) {
    const entry = nearmeKeyed[i]

    // Strategy A: Address hash
    if (entry.address_hash && dbAddressHashes.has(entry.address_hash)) {
      matchedByAddress.push(entry)
      matchedAny.add(i)
      continue // strongest match — no need to check other strategies
    }

    // Strategy B: Phone
    if (entry.phone_normalized && dbPhones.has(entry.phone_normalized)) {
      matchedByPhone.push(entry)
      matchedAny.add(i)
      continue
    }

    // Strategy C: Name + City (soft)
    if (dbNameCity.has(entry.name_city_key)) {
      matchedByNameCity.push(entry)
      matchedAny.add(i)
    }
  }

  const netNew = nearmeKeyed.filter((_, i) => !matchedAny.has(i))

  // ── Step 5: Geographic breakdown of net-new ───────────────────────────
  const netNewByState = new Map<string, number>()
  for (const entry of netNew) {
    const st = entry.row.state_addr || entry.row.state || 'Unknown'
    netNewByState.set(st, (netNewByState.get(st) || 0) + 1)
  }
  const sortedStates = [...netNewByState.entries()].sort((a, b) => b[1] - a[1])

  // States in DB
  const dbStates = new Set<string>()
  for (const store of dbStores) {
    if (store.state?.name) dbStates.add(store.state.name)
  }
  // Nearme states with no DB presence
  const nearmeStates = new Set(nearmeRows.map((r) => r.state).filter(Boolean))
  const newCoverageStates = [...nearmeStates].filter((s) => !dbStates.has(s)).sort()

  // ── Report ────────────────────────────────────────────────────────────
  console.log('')
  console.log('='.repeat(60))
  console.log('NEARME CSV OVERLAP AUDIT')
  console.log('='.repeat(60))
  console.log(`Nearme CSV rows:                ${nearmeRows.length.toLocaleString()}`)
  console.log(`DB stores (active):             ${dbStores.length.toLocaleString()}`)
  console.log(`DB stores with address_hash:    ${dbWithHash.toLocaleString()}  (${dbComputedHash.toLocaleString()} computed in-memory)`)
  console.log('')
  console.log('MATCHING RESULTS')
  console.log('─'.repeat(60))
  console.log(`Address hash matches:           ${matchedByAddress.length.toLocaleString()}  (strong — same address)`)
  console.log(`Phone matches:                  ${matchedByPhone.length.toLocaleString()}  (strong — same phone, different address)`)
  console.log(`Name+city matches:              ${matchedByNameCity.length.toLocaleString()}  (soft — needs review)`)
  console.log('')
  console.log(`Combined unique matches:        ${matchedAny.size.toLocaleString()}  (any strategy)`)
  console.log(`Net new stores (no match):      ${netNew.length.toLocaleString()}`)
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
    console.log('All nearme states already have DB coverage.')
  }
  console.log('='.repeat(60))

  // ── Export CSVs ───────────────────────────────────────────────────────
  if (shouldExport) {
    const exportDir = '/tmp/nearme-audit'
    fs.mkdirSync(exportDir, { recursive: true })

    const header = 'name,street,city,state,zip,phone,latitude,longitude,address_hash,phone_normalized'

    function rowToCsv(entry: (typeof nearmeKeyed)[0]): string {
      const r = entry.row
      return [
        csvField(r.name),
        csvField(r.street),
        csvField(r.city_addr),
        csvField(r.state_addr),
        csvField(r.zip),
        csvField(r.phone),
        csvField(r.latitude),
        csvField(r.longitude),
        csvField(entry.address_hash),
        csvField(entry.phone_normalized),
      ].join(',')
    }

    // Matched by address
    const addrCsv = [header, ...matchedByAddress.map(rowToCsv)].join('\n')
    fs.writeFileSync(path.join(exportDir, 'matched-address.csv'), addrCsv)

    // Matched by phone only
    const phoneCsv = [header, ...matchedByPhone.map(rowToCsv)].join('\n')
    fs.writeFileSync(path.join(exportDir, 'matched-phone.csv'), phoneCsv)

    // Matched by name+city
    const ncCsv = [header, ...matchedByNameCity.map(rowToCsv)].join('\n')
    fs.writeFileSync(path.join(exportDir, 'matched-name-city.csv'), ncCsv)

    // Net new
    const newCsv = [header, ...netNew.map(rowToCsv)].join('\n')
    fs.writeFileSync(path.join(exportDir, 'net-new.csv'), newCsv)

    console.log(`\nExported to ${exportDir}/`)
    console.log(`  matched-address.csv    (${matchedByAddress.length.toLocaleString()} rows)`)
    console.log(`  matched-phone.csv      (${matchedByPhone.length.toLocaleString()} rows)`)
    console.log(`  matched-name-city.csv  (${matchedByNameCity.length.toLocaleString()} rows)`)
    console.log(`  net-new.csv            (${netNew.length.toLocaleString()} rows)`)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
