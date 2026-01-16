#!/usr/bin/env npx tsx
/**
 * Backfill Address Hash for Deduplication
 *
 * Populates address_hash and phone_normalized columns for all existing stores.
 * Run this AFTER applying migration 0014_dedup_infrastructure.sql.
 *
 * Usage:
 *   npx tsx scripts/backfill-address-hash.ts [--dry-run]
 *
 * Options:
 *   --dry-run    Preview changes without writing to database
 */

import { hashAddress, normalizePhone } from '../lib/utils/address-normalizer'

interface BackfillStats {
  total: number
  updated: number
  skipped: number
  errors: number
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  console.log('='.repeat(60))
  console.log('Backfill Address Hash')
  console.log('='.repeat(60))
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`)
  console.log('')

  // Dynamic import to load env vars
  const { supabaseAdmin } = await import('../lib/supabase/admin')

  const stats: BackfillStats = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }

  // Fetch all stores that need backfill
  console.log('Fetching stores...')
  const { data: stores, error: fetchError } = await supabaseAdmin
    .from('stores')
    .select('id, address, phone, address_hash, phone_normalized')
    .order('id')

  if (fetchError) {
    console.error('Failed to fetch stores:', fetchError.message)
    process.exit(1)
  }

  if (!stores || stores.length === 0) {
    console.log('No stores found.')
    return
  }

  stats.total = stores.length
  console.log(`Found ${stores.length} stores\n`)

  // Process each store
  for (const store of stores) {
    // Skip if already has hash (idempotent)
    if (store.address_hash) {
      stats.skipped++
      continue
    }

    try {
      const newHash = store.address ? hashAddress(store.address) : null
      const newPhone = store.phone ? normalizePhone(store.phone) : null

      if (dryRun) {
        console.log(`[DRY RUN] Store ${store.id}:`)
        console.log(`  Address: "${store.address?.substring(0, 50)}..."`)
        console.log(`  Hash: ${newHash}`)
        console.log(`  Phone: ${store.phone} → ${newPhone}`)
        stats.updated++
      } else {
        const { error: updateError } = await supabaseAdmin
          .from('stores')
          .update({
            address_hash: newHash,
            phone_normalized: newPhone,
          })
          .eq('id', store.id)

        if (updateError) {
          console.error(`Failed to update store ${store.id}:`, updateError.message)
          stats.errors++
        } else {
          stats.updated++
          if (stats.updated % 100 === 0) {
            console.log(`Updated ${stats.updated} stores...`)
          }
        }
      }
    } catch (err) {
      console.error(`Error processing store ${store.id}:`, err)
      stats.errors++
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('Summary')
  console.log('='.repeat(60))
  console.log(`Total stores:  ${stats.total}`)
  console.log(`Updated:       ${stats.updated}`)
  console.log(`Skipped:       ${stats.skipped} (already had hash)`)
  console.log(`Errors:        ${stats.errors}`)

  if (dryRun) {
    console.log('\n[DRY RUN] No changes made. Remove --dry-run to apply.')
  } else {
    console.log('\nBackfill complete!')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
