#!/usr/bin/env npx tsx
/**
 * Detect Duplicate Stores
 *
 * Finds duplicate stores by:
 * 1. Address hash (strong match)
 * 2. Phone number (strong match)
 * 3. Same name + city (soft match - manual review)
 *
 * Run this AFTER backfill-address-hash.ts.
 *
 * Usage:
 *   npx tsx scripts/detect-duplicates.ts [--export]
 *
 * Options:
 *   --export    Export results to CSV files in /tmp/dedup/
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fs from 'node:fs'
import path from 'node:path'

interface DuplicateGroup {
  key: string
  storeIds: number[]
  stores: StoreInfo[]
}

interface StoreInfo {
  id: number
  name: string
  address: string
  city: string
  state: string
  phone: string | null
  google_place_id: string | null
  claimed_by: string | null
  is_verified: boolean
  created_at: string
}

async function main() {
  const shouldExport = process.argv.includes('--export')

  console.log('='.repeat(60))
  console.log('Duplicate Store Detection')
  console.log('='.repeat(60))
  console.log('')

  const { supabaseAdmin } = await import('../lib/supabase/admin')

  // Fetch all active stores with relevant fields (with pagination)
  console.log('Fetching stores...')
  const PAGE_SIZE = 1000
  const stores: any[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data, error: fetchError } = await supabaseAdmin
      .from('stores')
      .select(`
        id,
        name,
        address,
        phone,
        phone_normalized,
        address_hash,
        google_place_id,
        claimed_by,
        is_verified,
        is_archived,
        created_at,
        city:cities(name),
        state:states(name)
      `)
      .or('is_archived.is.null,is_archived.eq.false')
      .order('id')
      .range(offset, offset + PAGE_SIZE - 1)

    if (fetchError) {
      console.error('Failed to fetch stores:', fetchError.message)
      process.exit(1)
    }

    if (data && data.length > 0) {
      stores.push(...data)
      console.log(`  Fetched ${stores.length} stores...`)
      offset += PAGE_SIZE
      hasMore = data.length === PAGE_SIZE
    } else {
      hasMore = false
    }
  }

  if (stores.length === 0) {
    console.log('No stores found.')
    return
  }

  console.log(`Found ${stores.length} active stores\n`)

  // Transform data for easier processing
  const storeData: StoreInfo[] = stores.map((s: any) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    city: s.city?.name || '',
    state: s.state?.name || '',
    phone: s.phone,
    phone_normalized: s.phone_normalized,
    address_hash: s.address_hash,
    google_place_id: s.google_place_id,
    claimed_by: s.claimed_by,
    is_verified: s.is_verified,
    created_at: s.created_at,
  }))

  // =========================================================================
  // 1. Address Hash Duplicates (Strong Match)
  // =========================================================================
  console.log('─'.repeat(60))
  console.log('1. ADDRESS HASH DUPLICATES (Strong Match)')
  console.log('─'.repeat(60))

  const byAddressHash = new Map<string, StoreInfo[]>()
  for (const store of storeData) {
    const hash = (store as any).address_hash
    if (!hash) continue
    const existing = byAddressHash.get(hash) || []
    existing.push(store)
    byAddressHash.set(hash, existing)
  }

  const addressDupes: DuplicateGroup[] = []
  for (const [hash, group] of byAddressHash) {
    if (group.length > 1) {
      addressDupes.push({
        key: hash,
        storeIds: group.map((s) => s.id),
        stores: group.sort((a, b) => {
          // Sort: claimed first, then has google_place_id, then oldest
          if (a.claimed_by && !b.claimed_by) return -1
          if (!a.claimed_by && b.claimed_by) return 1
          if (a.google_place_id && !b.google_place_id) return -1
          if (!a.google_place_id && b.google_place_id) return 1
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }),
      })
    }
  }

  console.log(`Found ${addressDupes.length} duplicate groups by address hash\n`)
  for (const group of addressDupes.slice(0, 5)) {
    console.log(`  Hash: ${group.key}`)
    for (const store of group.stores) {
      const marker = store === group.stores[0] ? '★' : '  '
      console.log(`  ${marker} [${store.id}] ${store.name}`)
      console.log(`      ${store.address}, ${store.city}, ${store.state}`)
      console.log(`      Claimed: ${store.claimed_by ? 'Yes' : 'No'} | Google: ${store.google_place_id ? 'Yes' : 'No'}`)
    }
    console.log('')
  }
  if (addressDupes.length > 5) {
    console.log(`  ... and ${addressDupes.length - 5} more groups\n`)
  }

  // =========================================================================
  // 2. Phone Number Duplicates (Strong Match)
  // =========================================================================
  console.log('─'.repeat(60))
  console.log('2. PHONE NUMBER DUPLICATES (Strong Match)')
  console.log('─'.repeat(60))

  const byPhone = new Map<string, StoreInfo[]>()
  for (const store of storeData) {
    const phone = (store as any).phone_normalized
    if (!phone) continue
    const existing = byPhone.get(phone) || []
    existing.push(store)
    byPhone.set(phone, existing)
  }

  const phoneDupes: DuplicateGroup[] = []
  for (const [phone, group] of byPhone) {
    if (group.length > 1) {
      phoneDupes.push({
        key: phone,
        storeIds: group.map((s) => s.id),
        stores: group,
      })
    }
  }

  console.log(`Found ${phoneDupes.length} duplicate groups by phone\n`)
  for (const group of phoneDupes.slice(0, 5)) {
    console.log(`  Phone: ${group.key}`)
    for (const store of group.stores) {
      console.log(`    [${store.id}] ${store.name} - ${store.city}, ${store.state}`)
    }
    console.log('')
  }
  if (phoneDupes.length > 5) {
    console.log(`  ... and ${phoneDupes.length - 5} more groups\n`)
  }

  // =========================================================================
  // 3. Same Name + City (Soft Match - Manual Review)
  // =========================================================================
  console.log('─'.repeat(60))
  console.log('3. SAME NAME + CITY (Soft Match - Manual Review)')
  console.log('─'.repeat(60))

  const byNameCity = new Map<string, StoreInfo[]>()
  for (const store of storeData) {
    const key = `${store.name.toLowerCase().trim()}|${store.city.toLowerCase().trim()}`
    const existing = byNameCity.get(key) || []
    existing.push(store)
    byNameCity.set(key, existing)
  }

  const nameCityDupes: DuplicateGroup[] = []
  for (const [key, group] of byNameCity) {
    if (group.length > 1) {
      nameCityDupes.push({
        key,
        storeIds: group.map((s) => s.id),
        stores: group,
      })
    }
  }

  console.log(`Found ${nameCityDupes.length} groups with same name+city\n`)
  for (const group of nameCityDupes.slice(0, 5)) {
    const [name, city] = group.key.split('|')
    console.log(`  "${name}" in ${city}:`)
    for (const store of group.stores) {
      console.log(`    [${store.id}] ${store.address}`)
    }
    console.log('')
  }
  if (nameCityDupes.length > 5) {
    console.log(`  ... and ${nameCityDupes.length - 5} more groups\n`)
  }

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('='.repeat(60))
  console.log('Summary')
  console.log('='.repeat(60))
  console.log(`Total active stores:        ${storeData.length}`)
  console.log(`Address hash duplicates:    ${addressDupes.length} groups (${addressDupes.reduce((sum, g) => sum + g.stores.length, 0)} stores)`)
  console.log(`Phone duplicates:           ${phoneDupes.length} groups`)
  console.log(`Name+city duplicates:       ${nameCityDupes.length} groups`)

  // =========================================================================
  // Export to CSV
  // =========================================================================
  if (shouldExport) {
    const exportDir = '/tmp/dedup'
    fs.mkdirSync(exportDir, { recursive: true })

    // Export address hash duplicates
    const addressCsv = [
      'group_id,hash,store_id,name,address,city,state,claimed,google_place_id,is_canonical',
      ...addressDupes.flatMap((group, groupIdx) =>
        group.stores.map((store, storeIdx) =>
          [
            groupIdx + 1,
            group.key,
            store.id,
            `"${store.name.replace(/"/g, '""')}"`,
            `"${store.address.replace(/"/g, '""')}"`,
            store.city,
            store.state,
            store.claimed_by ? 'Yes' : 'No',
            store.google_place_id || '',
            storeIdx === 0 ? 'Yes' : 'No',
          ].join(',')
        )
      ),
    ].join('\n')
    fs.writeFileSync(path.join(exportDir, 'address-duplicates.csv'), addressCsv)
    console.log(`\nExported: ${exportDir}/address-duplicates.csv`)

    // Export phone duplicates
    const phoneCsv = [
      'group_id,phone,store_id,name,address,city,state',
      ...phoneDupes.flatMap((group, groupIdx) =>
        group.stores.map((store) =>
          [
            groupIdx + 1,
            group.key,
            store.id,
            `"${store.name.replace(/"/g, '""')}"`,
            `"${store.address.replace(/"/g, '""')}"`,
            store.city,
            store.state,
          ].join(',')
        )
      ),
    ].join('\n')
    fs.writeFileSync(path.join(exportDir, 'phone-duplicates.csv'), phoneCsv)
    console.log(`Exported: ${exportDir}/phone-duplicates.csv`)

    // Export name+city soft matches
    const nameCityCsv = [
      'group_id,name,city,store_id,address,claimed',
      ...nameCityDupes.flatMap((group, groupIdx) =>
        group.stores.map((store) =>
          [
            groupIdx + 1,
            `"${store.name.replace(/"/g, '""')}"`,
            store.city,
            store.id,
            `"${store.address.replace(/"/g, '""')}"`,
            store.claimed_by ? 'Yes' : 'No',
          ].join(',')
        )
      ),
    ].join('\n')
    fs.writeFileSync(path.join(exportDir, 'name-city-duplicates.csv'), nameCityCsv)
    console.log(`Exported: ${exportDir}/name-city-duplicates.csv`)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
