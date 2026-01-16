#!/usr/bin/env npx tsx
/**
 * Archive Hash Duplicates
 *
 * Archives stores that couldn't be updated due to hash conflicts.
 * These are true duplicates - the improved normalizer produces the same
 * hash for their address as an existing store.
 *
 * Usage:
 *   npx tsx scripts/archive-hash-duplicates.ts [--dry-run] [--execute]
 *
 * Options:
 *   --dry-run    Preview changes without writing (DEFAULT)
 *   --execute    Actually archive the duplicates
 */

import { hashAddress } from '../lib/utils/address-normalizer'

interface Store {
  id: number
  name: string
  address: string | null
  slug: string
  address_hash: string | null
  google_place_id: string | null
  claimed_by: string | null
  is_verified: boolean
  created_at: string
}

interface ArchiveStats {
  total: number
  duplicatesFound: number
  archived: number
  skipped: number
  errors: number
}

async function main() {
  const execute = process.argv.includes('--execute')
  const dryRun = !execute

  console.log('='.repeat(60))
  console.log('Archive Hash Duplicates')
  console.log('='.repeat(60))
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE EXECUTION'}`)
  console.log('')

  if (!dryRun) {
    console.log('WARNING: This will archive duplicate stores!')
    console.log('Press Ctrl+C within 5 seconds to cancel...')
    await new Promise((resolve) => setTimeout(resolve, 5000))
    console.log('')
  }

  const { supabaseAdmin } = await import('../lib/supabase/admin')

  const stats: ArchiveStats = {
    total: 0,
    duplicatesFound: 0,
    archived: 0,
    skipped: 0,
    errors: 0,
  }

  // Fetch all active stores
  console.log('Fetching all active stores...')
  let allStores: Store[] = []
  let offset = 0
  const limit = 1000

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('stores')
      .select('id, name, address, slug, address_hash, google_place_id, claimed_by, is_verified, created_at')
      .or('is_archived.is.null,is_archived.eq.false')
      .order('id')
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Failed to fetch stores:', error.message)
      process.exit(1)
    }

    if (!data || data.length === 0) break

    allStores = allStores.concat(data as Store[])
    offset += limit
    if (data.length < limit) break
  }

  stats.total = allStores.length
  console.log(`Found ${allStores.length} active stores\n`)

  // Build a map of hash -> store (for quick lookup)
  // Use only stores that have successfully been hashed
  const hashToStore = new Map<string, Store>()
  for (const store of allStores) {
    if (store.address_hash) {
      // If multiple stores have same hash, keep the one we consider "canonical"
      // (claimed > google_place_id > verified > oldest)
      const existing = hashToStore.get(store.address_hash)
      if (!existing || isMoreCanonical(store, existing)) {
        hashToStore.set(store.address_hash, store)
      }
    }
  }

  console.log(`Built hash index with ${hashToStore.size} unique hashes\n`)

  // Find stores whose computed hash matches an existing store's hash
  // but their stored hash is different (indicating they failed to update)
  const duplicates: Array<{ duplicate: Store; canonical: Store; newHash: string }> = []

  for (const store of allStores) {
    if (!store.address) continue

    const computedHash = hashAddress(store.address)
    if (!computedHash) continue

    // If stored hash equals computed hash, this store is fine
    if (store.address_hash === computedHash) continue

    // If computed hash matches another store, this is a duplicate
    const existingStore = hashToStore.get(computedHash)
    if (existingStore && existingStore.id !== store.id) {
      duplicates.push({
        duplicate: store,
        canonical: existingStore,
        newHash: computedHash,
      })
    }
  }

  stats.duplicatesFound = duplicates.length
  console.log(`Found ${duplicates.length} stores with hash conflicts (duplicates)\n`)

  if (duplicates.length === 0) {
    console.log('No duplicates to process!')
    return
  }

  // Process each duplicate
  console.log('Processing duplicates...\n')
  for (const { duplicate, canonical, newHash } of duplicates) {
    console.log(`Duplicate: [${duplicate.id}] ${duplicate.name}`)
    console.log(`  Address: ${duplicate.address?.substring(0, 60)}...`)
    console.log(`  Old hash: ${duplicate.address_hash}`)
    console.log(`  New hash: ${newHash}`)
    console.log(`  Canonical: [${canonical.id}] ${canonical.name}`)

    // Skip if duplicate is claimed but canonical is not
    if (duplicate.claimed_by && !canonical.claimed_by) {
      console.log(`  SKIPPED: Duplicate is claimed, canonical is not`)
      stats.skipped++
      console.log('')
      continue
    }

    if (dryRun) {
      console.log(`  [DRY RUN] Would archive store ${duplicate.id}`)
      stats.archived++
      console.log('')
      continue
    }

    try {
      // Create slug redirect if different
      if (duplicate.slug && duplicate.slug !== canonical.slug) {
        const { error: redirectError } = await supabaseAdmin
          .from('store_slug_redirects')
          .upsert({
            old_slug: duplicate.slug,
            canonical_store_id: canonical.id,
          })

        if (redirectError) {
          console.warn(`  Warning: Failed to create redirect: ${redirectError.message}`)
        }
      }

      // Archive the duplicate
      const { error: archiveError } = await supabaseAdmin
        .from('stores')
        .update({
          is_archived: true,
          archived_reason: 'duplicate_hash_conflict',
          merged_into_store_id: canonical.id,
        })
        .eq('id', duplicate.id)

      if (archiveError) {
        console.error(`  ERROR: Failed to archive: ${archiveError.message}`)
        stats.errors++
      } else {
        console.log(`  Archived store ${duplicate.id} -> merged into ${canonical.id}`)
        stats.archived++
      }

      // Log to ingestion_log
      await supabaseAdmin
        .from('ingestion_log')
        .insert({
          operation: 'archive_hash_duplicate',
          entity_type: 'store',
          entity_id: canonical.id,
          details: {
            canonical_store_id: canonical.id,
            archived_store_id: duplicate.id,
            old_hash: duplicate.address_hash,
            new_hash: newHash,
            archived_at: new Date().toISOString(),
          },
        })
    } catch (err) {
      console.error(`  ERROR: ${err}`)
      stats.errors++
    }

    console.log('')
  }

  // Summary
  console.log('='.repeat(60))
  console.log('Summary')
  console.log('='.repeat(60))
  console.log(`Total active stores:    ${stats.total}`)
  console.log(`Duplicates found:       ${stats.duplicatesFound}`)
  console.log(`Archived:               ${stats.archived}`)
  console.log(`Skipped (claimed):      ${stats.skipped}`)
  console.log(`Errors:                 ${stats.errors}`)

  if (dryRun) {
    console.log('\n[DRY RUN] No changes made. Use --execute to apply.')
  } else {
    console.log('\nArchive complete!')
  }
}

/**
 * Check if store A is more "canonical" than store B
 */
function isMoreCanonical(a: Store, b: Store): boolean {
  // Claimed stores are most canonical
  if (a.claimed_by && !b.claimed_by) return true
  if (!a.claimed_by && b.claimed_by) return false

  // Has google_place_id
  if (a.google_place_id && !b.google_place_id) return true
  if (!a.google_place_id && b.google_place_id) return false

  // Is verified
  if (a.is_verified && !b.is_verified) return true
  if (!a.is_verified && b.is_verified) return false

  // Oldest wins
  return new Date(a.created_at).getTime() < new Date(b.created_at).getTime()
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
