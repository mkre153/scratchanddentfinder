#!/usr/bin/env npx tsx
/**
 * Fuzzy Duplicate Detection
 *
 * Finds duplicates that escaped hash-based detection due to:
 * - Doubled ZIP codes (e.g., "02903 02903")
 * - Missing ZIP codes
 * - State name variations (Rhode Island vs RI)
 *
 * Detection methods:
 * 1. Same phone + city (strong indicator of duplicate)
 * 2. Normalized street address + city (strips ZIP/state variations)
 * 3. Same name + city with similar addresses
 *
 * Usage:
 *   npx tsx scripts/detect-duplicates-fuzzy.ts
 *   npx tsx scripts/detect-duplicates-fuzzy.ts --export
 */

import fs from 'node:fs'
import path from 'node:path'
import { supabaseAdmin } from '../lib/supabase/admin'

interface Store {
  id: number
  name: string
  address: string
  phone: string | null
  phone_normalized: string | null
  zip: string | null
  city_name: string
  state_name: string
  google_place_id: string | null
  website: string | null
  is_verified: boolean
  created_at: string
}

interface DuplicateGroup {
  reason: string
  key: string
  stores: Store[]
  canonical: Store
  duplicates: Store[]
}

/**
 * Extract just the street portion of an address (number + street name)
 * Strips city, state, ZIP variations
 */
function extractStreetOnly(address: string): string {
  if (!address) return ''

  return address
    .toLowerCase()
    // Remove everything after common city indicators
    .replace(/,\s*(city|town|village)?\s*of\s+.*/i, '')
    // Remove state names
    .replace(/\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)\b/gi, '')
    // Remove 2-letter state codes
    .replace(/\b(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy)\b/gi, '')
    // Remove ZIP codes (including doubled ones like "02903 02903")
    .replace(/\b(\d{5})\s+\1\b/g, '')
    .replace(/\b\d{5}(?:-?\d{4})?\b/g, '')
    // Remove punctuation
    .replace(/[^\w\s]/g, ' ')
    // Normalize street suffixes
    .replace(/\b(street|str)\b/g, 'st')
    .replace(/\b(avenue|ave)\b/g, 'av')
    .replace(/\b(boulevard|blvd)\b/g, 'bl')
    .replace(/\b(drive|dr)\b/g, 'dr')
    .replace(/\b(road|rd)\b/g, 'rd')
    .replace(/\b(lane|ln)\b/g, 'ln')
    .replace(/\b(court|ct)\b/g, 'ct')
    .replace(/\b(place|pl)\b/g, 'pl')
    .replace(/\b(highway|hwy)\b/g, 'hw')
    // Normalize directions
    .replace(/\bnorth\b/g, 'n')
    .replace(/\bsouth\b/g, 's')
    .replace(/\beast\b/g, 'e')
    .replace(/\bwest\b/g, 'w')
    // Remove unit/suite
    .replace(/\b(suite|ste|unit|apt|apartment|#|bldg|building|floor|fl)\s*\w*\b/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Check if an address has a doubled ZIP code pattern
 */
function hasDoubledZip(address: string): boolean {
  if (!address) return false
  return /\b(\d{5})\s+\1\b/.test(address)
}

/**
 * Select the canonical (best) store from a group
 * Priority: claimed > has_google_place_id > has_website > no_doubled_zip > is_verified > oldest
 */
function selectCanonical(stores: Store[]): { canonical: Store; duplicates: Store[] } {
  const sorted = [...stores].sort((a, b) => {
    // Has google_place_id
    if (a.google_place_id && !b.google_place_id) return -1
    if (!a.google_place_id && b.google_place_id) return 1

    // Has website
    if (a.website && !b.website) return -1
    if (!a.website && b.website) return 1

    // No doubled ZIP in address (cleaner data)
    const aDoubled = hasDoubledZip(a.address)
    const bDoubled = hasDoubledZip(b.address)
    if (!aDoubled && bDoubled) return -1
    if (aDoubled && !bDoubled) return 1

    // Is verified
    if (a.is_verified && !b.is_verified) return -1
    if (!a.is_verified && b.is_verified) return 1

    // Oldest (more established)
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  return {
    canonical: sorted[0],
    duplicates: sorted.slice(1),
  }
}

async function main() {
  const shouldExport = process.argv.includes('--export')

  console.log('='.repeat(70))
  console.log('Fuzzy Duplicate Detection')
  console.log('='.repeat(70))
  console.log('')

  // Fetch all active stores with city/state info
  console.log('Fetching stores...')

  let allStores: Store[] = []
  let offset = 0
  const limit = 1000

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('stores')
      .select(`
        id,
        name,
        address,
        phone,
        phone_normalized,
        zip,
        google_place_id,
        website,
        is_verified,
        created_at,
        city:cities(name),
        state:states(name)
      `)
      .or('is_archived.is.null,is_archived.eq.false')
      .eq('is_approved', true)
      .range(offset, offset + limit - 1)
      .order('id')

    if (error) {
      console.error('Error fetching stores:', error.message)
      process.exit(1)
    }

    if (!data || data.length === 0) break

    const mapped = data.map((s: any) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      phone: s.phone,
      phone_normalized: s.phone_normalized,
      zip: s.zip,
      city_name: s.city?.name || '',
      state_name: s.state?.name || '',
      google_place_id: s.google_place_id,
      website: s.website,
      is_verified: s.is_verified,
      created_at: s.created_at,
    }))

    allStores = allStores.concat(mapped)
    offset += limit
    if (data.length < limit) break
  }

  console.log(`Found ${allStores.length} active stores\n`)

  // Track all duplicate groups found
  const duplicateGroups: DuplicateGroup[] = []
  const processedIds = new Set<number>()

  // =========================================================================
  // Method 1: Same phone + same city (STRONG indicator)
  // =========================================================================
  console.log('─'.repeat(70))
  console.log('Method 1: PHONE + CITY DUPLICATES')
  console.log('─'.repeat(70))

  const byPhoneCity = new Map<string, Store[]>()
  for (const store of allStores) {
    if (!store.phone_normalized || !store.city_name) continue
    const key = `${store.phone_normalized}|${store.city_name.toLowerCase()}`
    const existing = byPhoneCity.get(key) || []
    existing.push(store)
    byPhoneCity.set(key, existing)
  }

  let phoneCityDupes = 0
  for (const [key, group] of byPhoneCity) {
    if (group.length > 1) {
      // Skip if all stores in group are already processed
      if (group.every((s) => processedIds.has(s.id))) continue

      const { canonical, duplicates } = selectCanonical(group)
      duplicateGroups.push({
        reason: 'phone_city',
        key,
        stores: group,
        canonical,
        duplicates,
      })

      group.forEach((s) => processedIds.add(s.id))
      phoneCityDupes++
    }
  }

  console.log(`Found ${phoneCityDupes} duplicate groups by phone+city\n`)

  // Show samples
  const phoneCitySamples = duplicateGroups.filter((g) => g.reason === 'phone_city').slice(0, 5)
  for (const group of phoneCitySamples) {
    const [phone, city] = group.key.split('|')
    console.log(`  Phone: ${phone} | City: ${city}`)
    for (const store of group.stores) {
      const marker = store.id === group.canonical.id ? '★' : '  '
      const flags = [
        hasDoubledZip(store.address) ? 'DOUBLED_ZIP' : null,
        store.google_place_id ? 'HAS_GPID' : null,
        store.website ? 'HAS_WEB' : null,
      ]
        .filter(Boolean)
        .join(', ')
      console.log(`  ${marker} [${store.id}] ${store.name}`)
      console.log(`       ${store.address}`)
      if (flags) console.log(`       Flags: ${flags}`)
    }
    console.log('')
  }

  // =========================================================================
  // Method 2: Normalized street + city (catches ZIP variations)
  // =========================================================================
  console.log('─'.repeat(70))
  console.log('Method 2: NORMALIZED STREET + CITY')
  console.log('─'.repeat(70))

  const byStreetCity = new Map<string, Store[]>()
  for (const store of allStores) {
    if (processedIds.has(store.id)) continue
    if (!store.address || !store.city_name) continue

    const street = extractStreetOnly(store.address)
    if (!street || street.length < 5) continue // Skip very short/empty

    const key = `${street}|${store.city_name.toLowerCase()}`
    const existing = byStreetCity.get(key) || []
    existing.push(store)
    byStreetCity.set(key, existing)
  }

  let streetCityDupes = 0
  for (const [key, group] of byStreetCity) {
    if (group.length > 1) {
      const { canonical, duplicates } = selectCanonical(group)
      duplicateGroups.push({
        reason: 'street_city',
        key,
        stores: group,
        canonical,
        duplicates,
      })

      group.forEach((s) => processedIds.add(s.id))
      streetCityDupes++
    }
  }

  console.log(`Found ${streetCityDupes} duplicate groups by normalized street+city\n`)

  // Show samples
  const streetCitySamples = duplicateGroups.filter((g) => g.reason === 'street_city').slice(0, 5)
  for (const group of streetCitySamples) {
    const [street, city] = group.key.split('|')
    console.log(`  Street: "${street}" | City: ${city}`)
    for (const store of group.stores) {
      const marker = store.id === group.canonical.id ? '★' : '  '
      const flags = [
        hasDoubledZip(store.address) ? 'DOUBLED_ZIP' : null,
        store.google_place_id ? 'HAS_GPID' : null,
      ]
        .filter(Boolean)
        .join(', ')
      console.log(`  ${marker} [${store.id}] ${store.name}`)
      console.log(`       Original: ${store.address}`)
      if (flags) console.log(`       Flags: ${flags}`)
    }
    console.log('')
  }

  // =========================================================================
  // Stats on doubled ZIP addresses
  // =========================================================================
  console.log('─'.repeat(70))
  console.log('DOUBLED ZIP ANALYSIS')
  console.log('─'.repeat(70))

  const doubledZipStores = allStores.filter((s) => hasDoubledZip(s.address))
  console.log(`Stores with doubled ZIP pattern: ${doubledZipStores.length}`)
  if (doubledZipStores.length > 0) {
    console.log('\nSamples:')
    for (const store of doubledZipStores.slice(0, 10)) {
      const match = store.address.match(/\b(\d{5})\s+\1\b/)
      console.log(`  [${store.id}] ${store.name}`)
      console.log(`       ${store.address}`)
      console.log(`       Doubled: ${match ? match[0] : 'N/A'}`)
    }
  }

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n' + '='.repeat(70))
  console.log('SUMMARY')
  console.log('='.repeat(70))

  const totalDuplicateGroups = duplicateGroups.length
  const totalDuplicateStores = duplicateGroups.reduce((sum, g) => sum + g.duplicates.length, 0)

  console.log(`Total active stores:              ${allStores.length}`)
  console.log(`Stores with doubled ZIP:          ${doubledZipStores.length}`)
  console.log(`Duplicate groups found:           ${totalDuplicateGroups}`)
  console.log(`Total duplicate stores to merge:  ${totalDuplicateStores}`)
  console.log(`Estimated clean store count:      ${allStores.length - totalDuplicateStores}`)
  console.log(`Duplicate rate:                   ${((totalDuplicateStores / allStores.length) * 100).toFixed(2)}%`)

  // =========================================================================
  // Export
  // =========================================================================
  if (shouldExport) {
    const exportDir = '/tmp/dedup-fuzzy'
    fs.mkdirSync(exportDir, { recursive: true })

    // Export all duplicate groups
    const csv = [
      'group_id,reason,canonical_id,duplicate_id,canonical_name,duplicate_name,canonical_address,duplicate_address,has_doubled_zip',
      ...duplicateGroups.flatMap((group, groupIdx) =>
        group.duplicates.map((dup) =>
          [
            groupIdx + 1,
            group.reason,
            group.canonical.id,
            dup.id,
            `"${group.canonical.name.replace(/"/g, '""')}"`,
            `"${dup.name.replace(/"/g, '""')}"`,
            `"${group.canonical.address.replace(/"/g, '""')}"`,
            `"${dup.address.replace(/"/g, '""')}"`,
            hasDoubledZip(dup.address) ? 'Yes' : 'No',
          ].join(',')
        )
      ),
    ].join('\n')

    const csvPath = path.join(exportDir, 'fuzzy-duplicates.csv')
    fs.writeFileSync(csvPath, csv)
    console.log(`\nExported: ${csvPath}`)

    // Export merge commands
    const mergeScript = duplicateGroups
      .map(
        (group) =>
          `# Group: ${group.reason} - Keep [${group.canonical.id}] ${group.canonical.name}\n` +
          group.duplicates.map((d) => `# Archive [${d.id}] ${d.name}`).join('\n')
      )
      .join('\n\n')

    const mergePath = path.join(exportDir, 'merge-plan.txt')
    fs.writeFileSync(mergePath, mergeScript)
    console.log(`Exported: ${mergePath}`)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
