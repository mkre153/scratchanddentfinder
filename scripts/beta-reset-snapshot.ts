#!/usr/bin/env npx tsx
/**
 * Beta Reset Snapshot
 *
 * Creates a safety snapshot of the stores table before any mutations.
 * This is for manual rollback only - no automated restore.
 *
 * Usage:
 *   npx tsx scripts/beta-reset-snapshot.ts
 *
 * Output:
 *   /tmp/sdf-beta-reset/stores-snapshot-{timestamp}.json
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fs from 'node:fs'
import path from 'node:path'

const OUTPUT_DIR = '/tmp/sdf-beta-reset'

async function main() {
  console.log('='.repeat(60))
  console.log('Beta Reset Snapshot')
  console.log('='.repeat(60))
  console.log('')

  const { supabaseAdmin } = await import('../lib/supabase/admin')

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Generate timestamp for filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `stores-snapshot-${timestamp}.json`
  const filepath = path.join(OUTPUT_DIR, filename)

  console.log('Fetching all stores (including archived)...')

  // Fetch ALL stores with pagination (Supabase default limit is 1000)
  const PAGE_SIZE = 1000
  const stores: any[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from('stores')
      .select('*')
      .order('id')
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.error('Failed to fetch stores:', error.message)
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
    console.log('No stores found in database.')
    process.exit(0)
  }

  // Calculate some stats before saving
  const stats = {
    totalStores: stores.length,
    activeStores: stores.filter((s) => !s.is_archived).length,
    archivedStores: stores.filter((s) => s.is_archived).length,
    withZip: stores.filter((s) => s.zip).length,
    withoutZip: stores.filter((s) => !s.zip).length,
    withAddressHash: stores.filter((s) => s.address_hash).length,
    withoutAddressHash: stores.filter((s) => !s.address_hash).length,
    doubledZipInAddress: stores.filter((s) => /\b(\d{5})\s+\1\b/.test(s.address || '')).length,
  }

  // Create snapshot object
  const snapshot = {
    metadata: {
      createdAt: new Date().toISOString(),
      purpose: 'Beta data reset safety snapshot',
      stats,
    },
    stores,
  }

  // Write to file
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2))

  console.log('')
  console.log('='.repeat(60))
  console.log('Snapshot Created')
  console.log('='.repeat(60))
  console.log('')
  console.log(`File: ${filepath}`)
  console.log(`Size: ${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB`)
  console.log('')
  console.log('Store Statistics:')
  console.log(`  Total stores:           ${stats.totalStores}`)
  console.log(`  Active stores:          ${stats.activeStores}`)
  console.log(`  Archived stores:        ${stats.archivedStores}`)
  console.log(`  With ZIP:               ${stats.withZip}`)
  console.log(`  Without ZIP:            ${stats.withoutZip}`)
  console.log(`  With address_hash:      ${stats.withAddressHash}`)
  console.log(`  Without address_hash:   ${stats.withoutAddressHash}`)
  console.log(`  Doubled ZIP in address: ${stats.doubledZipInAddress}`)
  console.log('')
  console.log('This snapshot is for manual rollback only.')
  console.log('Keep this file until the beta reset is verified complete.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
