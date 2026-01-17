#!/usr/bin/env npx tsx
/**
 * Beta Reset Address Cleanup
 *
 * Phase 1.1-1.2 of the beta data reset:
 * - Fix doubled ZIPs in address field (e.g., "02903 02903" → "02903")
 * - Extract and validate ZIP codes from address strings
 * - Clear invalid ZIPs for later backfill
 *
 * Does NOT:
 * - Change slugs, store IDs, city/state relations
 * - Run reverse geocoding (Phase 1.3, separate script)
 *
 * Usage:
 *   npx tsx scripts/beta-reset-address-cleanup.ts [--dry-run] [--execute]
 *
 * Options:
 *   --dry-run    Preview changes without writing (DEFAULT)
 *   --execute    Actually perform the cleanup
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { extractZipFromAddress } from '../lib/utils/address-normalizer'

interface CleanupStats {
  totalStores: number
  doubledZipsFixed: number
  zipsExtracted: number
  invalidZipsCleared: number
  unchanged: number
  errors: number
}

interface StoreChange {
  id: number
  name: string
  field: string
  before: string | null
  after: string | null
  reason: string
}

// Valid US ZIP range: 00501 (NY) to 99950 (AK)
function isValidZip(zip: string | null): boolean {
  if (!zip) return false
  const num = parseInt(zip, 10)
  return num >= 501 && num <= 99950
}

// Fix doubled ZIP codes in address string
function fixDoubledZip(address: string): string {
  // Pattern: "02903 02903" at end or anywhere
  return address.replace(/\b(\d{5})\s+\1\b/g, '$1')
}

async function main() {
  const args = process.argv.slice(2)
  const execute = args.includes('--execute')
  const dryRun = !execute

  console.log('='.repeat(60))
  console.log('Beta Reset Address Cleanup')
  console.log('='.repeat(60))
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes)' : '⚠️  LIVE EXECUTION'}`)
  console.log('')

  if (!dryRun) {
    console.log('⚠️  WARNING: This will modify the database!')
    console.log('   Press Ctrl+C within 5 seconds to cancel...')
    await new Promise((resolve) => setTimeout(resolve, 5000))
    console.log('')
  }

  const { supabaseAdmin } = await import('../lib/supabase/admin')

  const stats: CleanupStats = {
    totalStores: 0,
    doubledZipsFixed: 0,
    zipsExtracted: 0,
    invalidZipsCleared: 0,
    unchanged: 0,
    errors: 0,
  }

  const changes: StoreChange[] = []

  // Fetch all active stores
  console.log('Fetching stores...')
  const { data: stores, error: fetchError } = await supabaseAdmin
    .from('stores')
    .select('id, name, address, zip')
    .or('is_archived.is.null,is_archived.eq.false')
    .order('id')

  if (fetchError) {
    console.error('Failed to fetch stores:', fetchError.message)
    process.exit(1)
  }

  stats.totalStores = stores.length
  console.log(`Found ${stats.totalStores} active stores\n`)

  // Process each store
  for (const store of stores) {
    let addressChanged = false
    let zipChanged = false
    let newAddress = store.address
    let newZip = store.zip

    // Step 1.1: Fix doubled ZIPs in address
    if (store.address) {
      const fixedAddress = fixDoubledZip(store.address)
      if (fixedAddress !== store.address) {
        addressChanged = true
        newAddress = fixedAddress
        stats.doubledZipsFixed++
        changes.push({
          id: store.id,
          name: store.name,
          field: 'address',
          before: store.address,
          after: fixedAddress,
          reason: 'doubled_zip_fixed',
        })
      }
    }

    // Step 1.2a: Extract ZIP from address if missing
    if (!newZip && newAddress) {
      const extractedZip = extractZipFromAddress(newAddress)
      if (extractedZip && isValidZip(extractedZip)) {
        zipChanged = true
        newZip = extractedZip
        stats.zipsExtracted++
        changes.push({
          id: store.id,
          name: store.name,
          field: 'zip',
          before: null,
          after: extractedZip,
          reason: 'extracted_from_address',
        })
      }
    }

    // Step 1.2b: Validate existing ZIP
    if (newZip && !isValidZip(newZip)) {
      // Invalid ZIP - clear it for later backfill
      changes.push({
        id: store.id,
        name: store.name,
        field: 'zip',
        before: newZip,
        after: null,
        reason: 'invalid_zip_cleared',
      })
      newZip = null
      zipChanged = true
      stats.invalidZipsCleared++
    }

    // Apply changes
    if (addressChanged || zipChanged) {
      if (!dryRun) {
        const updates: Record<string, string | null> = {}
        if (addressChanged) updates.address = newAddress
        if (zipChanged) updates.zip = newZip

        const { error: updateError } = await supabaseAdmin
          .from('stores')
          .update(updates)
          .eq('id', store.id)

        if (updateError) {
          console.error(`  Error updating store ${store.id}: ${updateError.message}`)
          stats.errors++
        }
      }
    } else {
      stats.unchanged++
    }
  }

  // Log to ingestion_log
  if (!dryRun && (stats.doubledZipsFixed > 0 || stats.zipsExtracted > 0 || stats.invalidZipsCleared > 0)) {
    const { error: logError } = await supabaseAdmin.from('ingestion_log').insert({
      operation: 'beta_address_reset',
      source: 'beta-reset-address-cleanup',
      records_affected: stats.doubledZipsFixed + stats.zipsExtracted + stats.invalidZipsCleared,
      initiated_by: 'system',
    })

    if (logError) {
      console.warn(`Warning: Failed to log to ingestion_log: ${logError.message}`)
    }
  }

  // Print summary
  console.log('='.repeat(60))
  console.log('Summary')
  console.log('='.repeat(60))
  console.log(`Mode:                 ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`Total stores:         ${stats.totalStores}`)
  console.log(`Doubled ZIPs fixed:   ${stats.doubledZipsFixed}`)
  console.log(`ZIPs extracted:       ${stats.zipsExtracted}`)
  console.log(`Invalid ZIPs cleared: ${stats.invalidZipsCleared}`)
  console.log(`Unchanged:            ${stats.unchanged}`)
  console.log(`Errors:               ${stats.errors}`)
  console.log('')

  // Print sample changes
  if (changes.length > 0) {
    console.log('Sample Changes (first 10):')
    console.log('-'.repeat(60))
    for (const change of changes.slice(0, 10)) {
      console.log(`  [${change.id}] ${change.name}`)
      console.log(`    ${change.field}: "${change.before}" → "${change.after}" (${change.reason})`)
    }
    if (changes.length > 10) {
      console.log(`  ... and ${changes.length - 10} more`)
    }
    console.log('')
  }

  // Calculate ZIP coverage
  const beforeZipCount = stores.filter((s) => s.zip).length
  const afterZipCount = stores.filter((s) => s.zip).length + stats.zipsExtracted - stats.invalidZipsCleared
  const beforePct = ((beforeZipCount / stats.totalStores) * 100).toFixed(1)
  const afterPct = ((afterZipCount / stats.totalStores) * 100).toFixed(1)

  console.log('ZIP Coverage:')
  console.log(`  Before: ${beforeZipCount}/${stats.totalStores} (${beforePct}%)`)
  console.log(`  After:  ${afterZipCount}/${stats.totalStores} (${afterPct}%)`)
  console.log(`  Improvement: +${stats.zipsExtracted} extracted`)
  console.log('')

  if (dryRun) {
    console.log('[DRY RUN] No changes made. Use --execute to apply.')
  } else if (stats.errors === 0) {
    console.log('✅ Cleanup complete!')
  } else {
    console.log('⚠️  Cleanup completed with errors. Review output above.')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
