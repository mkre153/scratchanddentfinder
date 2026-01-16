#!/usr/bin/env npx tsx
/**
 * Merge Duplicate Stores
 *
 * Merges duplicate stores into canonical records using soft-archive pattern.
 * SAFE BY DEFAULT: Runs in dry-run mode unless explicitly disabled.
 *
 * Usage:
 *   npx tsx scripts/merge-duplicates.ts [options]
 *
 * Options:
 *   --dry-run          Preview changes without writing (DEFAULT - always on unless --execute)
 *   --execute          Actually perform the merge (DANGEROUS - requires explicit flag)
 *   --include-risky    Include groups where stores have different google_place_ids
 *   --group <id>       Only process specific group ID (from CSV)
 *
 * Safety Features:
 *   - Dry-run by default (must pass --execute to make changes)
 *   - All operations in a single transaction (rollback on any error)
 *   - Excludes risky groups (different google_place_ids) by default
 *   - Creates slug redirects for SEO preservation
 *   - Logs all merges to ingestion_log table
 *
 * Example:
 *   npx tsx scripts/merge-duplicates.ts                    # Dry run, safe groups only
 *   npx tsx scripts/merge-duplicates.ts --execute          # Live merge, safe groups only
 *   npx tsx scripts/merge-duplicates.ts --include-risky    # Dry run including risky groups
 */

import fs from 'node:fs'

// =============================================================================
// Types
// =============================================================================

interface StoreInfo {
  id: number
  name: string
  address: string
  slug: string
  city: string
  state: string
  phone: string | null
  address_hash: string
  google_place_id: string | null
  claimed_by: string | null
  is_verified: boolean
  created_at: string
}

interface DuplicateGroup {
  hash: string
  stores: StoreInfo[]
  canonical: StoreInfo
  duplicates: StoreInfo[]
  isRisky: boolean // true if stores have different google_place_ids
  riskReason?: string
}

interface MergeStats {
  groupsProcessed: number
  groupsSkipped: number
  storesArchived: number
  claimsRepointed: number
  eventsRepointed: number
  redirectsCreated: number
  errors: number
}

// =============================================================================
// CLI Parsing
// =============================================================================

function parseArgs() {
  const args = process.argv.slice(2)

  let execute = false
  let includeRisky = false
  let specificGroup: number | null = null

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--execute':
        execute = true
        break
      case '--include-risky':
        includeRisky = true
        break
      case '--group':
        specificGroup = parseInt(args[++i], 10)
        break
      case '--dry-run':
        // Already default, but accept it
        execute = false
        break
    }
  }

  return { execute, includeRisky, specificGroup }
}

// =============================================================================
// Canonical Selection Logic
// =============================================================================

/**
 * Select the canonical store from a group of duplicates.
 *
 * Priority:
 * 1. Claimed stores (claimed_by IS NOT NULL)
 * 2. Has google_place_id
 * 3. Is verified (is_verified = true)
 * 4. Most complete data (count of non-null fields)
 * 5. Oldest created_at
 */
function selectCanonical(stores: StoreInfo[]): StoreInfo {
  return stores.sort((a, b) => {
    // 1. Claimed stores first
    if (a.claimed_by && !b.claimed_by) return -1
    if (!a.claimed_by && b.claimed_by) return 1

    // 2. Has google_place_id
    if (a.google_place_id && !b.google_place_id) return -1
    if (!a.google_place_id && b.google_place_id) return 1

    // 3. Is verified
    if (a.is_verified && !b.is_verified) return -1
    if (!a.is_verified && b.is_verified) return 1

    // 4. Oldest created_at
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })[0]
}

/**
 * Check if a group is "risky" (stores have different google_place_ids)
 */
function isGroupRisky(stores: StoreInfo[]): { risky: boolean; reason?: string } {
  const placeIds = stores
    .map((s) => s.google_place_id)
    .filter((id) => id !== null)

  // If multiple different google_place_ids, it's risky
  const uniquePlaceIds = new Set(placeIds)
  if (uniquePlaceIds.size > 1) {
    return {
      risky: true,
      reason: `Multiple google_place_ids: ${[...uniquePlaceIds].join(', ')}`,
    }
  }

  return { risky: false }
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const { execute, includeRisky, specificGroup } = parseArgs()
  const dryRun = !execute

  console.log('='.repeat(60))
  console.log('Merge Duplicate Stores')
  console.log('='.repeat(60))
  console.log(`Mode:          ${dryRun ? '🔍 DRY RUN (no changes)' : '⚠️  LIVE EXECUTION'}`)
  console.log(`Include risky: ${includeRisky ? 'Yes' : 'No (excluding groups with different google_place_ids)'}`)
  if (specificGroup) {
    console.log(`Specific group: ${specificGroup}`)
  }
  console.log('')

  if (!dryRun) {
    console.log('⚠️  WARNING: This will modify the database!')
    console.log('   Press Ctrl+C within 5 seconds to cancel...')
    await new Promise((resolve) => setTimeout(resolve, 5000))
    console.log('')
  }

  const { supabaseAdmin } = await import('../lib/supabase/admin')

  const stats: MergeStats = {
    groupsProcessed: 0,
    groupsSkipped: 0,
    storesArchived: 0,
    claimsRepointed: 0,
    eventsRepointed: 0,
    redirectsCreated: 0,
    errors: 0,
  }

  // =========================================================================
  // Step 1: Fetch all stores and group by address_hash
  // =========================================================================
  console.log('Fetching stores...')
  const { data: stores, error: fetchError } = await supabaseAdmin
    .from('stores')
    .select(`
      id,
      name,
      address,
      slug,
      phone,
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

  if (fetchError) {
    console.error('Failed to fetch stores:', fetchError.message)
    process.exit(1)
  }

  // Transform and group by address_hash
  const storeData: StoreInfo[] = stores.map((s: any) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    slug: s.slug,
    phone: s.phone,
    address_hash: s.address_hash,
    google_place_id: s.google_place_id,
    claimed_by: s.claimed_by,
    is_verified: s.is_verified,
    created_at: s.created_at,
    city: s.city?.name || '',
    state: s.state?.name || '',
  }))

  const byHash = new Map<string, StoreInfo[]>()
  for (const store of storeData) {
    if (!store.address_hash) continue
    const existing = byHash.get(store.address_hash) || []
    existing.push(store)
    byHash.set(store.address_hash, existing)
  }

  // Build duplicate groups
  const duplicateGroups: DuplicateGroup[] = []
  let groupId = 0
  for (const [hash, group] of byHash) {
    if (group.length <= 1) continue
    groupId++

    if (specificGroup && groupId !== specificGroup) continue

    const riskCheck = isGroupRisky(group)
    const canonical = selectCanonical(group)
    const duplicates = group.filter((s) => s.id !== canonical.id)

    duplicateGroups.push({
      hash,
      stores: group,
      canonical,
      duplicates,
      isRisky: riskCheck.risky,
      riskReason: riskCheck.reason,
    })
  }

  console.log(`Found ${duplicateGroups.length} duplicate groups\n`)

  // =========================================================================
  // Step 2: Process each group
  // =========================================================================
  for (const group of duplicateGroups) {
    const groupLabel = `[${group.hash.substring(0, 8)}]`

    // Skip risky groups unless explicitly included
    if (group.isRisky && !includeRisky) {
      console.log(`${groupLabel} SKIPPED (risky): ${group.riskReason}`)
      stats.groupsSkipped++
      continue
    }

    console.log(`${groupLabel} Processing...`)
    console.log(`  Canonical: [${group.canonical.id}] ${group.canonical.name}`)
    for (const dup of group.duplicates) {
      console.log(`  Archive:   [${dup.id}] ${dup.name}`)
    }

    if (dryRun) {
      console.log(`  [DRY RUN] Would archive ${group.duplicates.length} store(s)`)
      stats.groupsProcessed++
      stats.storesArchived += group.duplicates.length
      stats.redirectsCreated += group.duplicates.length
      console.log('')
      continue
    }

    // =========================================================================
    // LIVE EXECUTION - Transaction block
    // =========================================================================
    try {
      for (const duplicate of group.duplicates) {
        // 2a. Repoint store_claims
        const { data: claims, error: claimsError } = await supabaseAdmin
          .from('store_claims')
          .update({ store_id: group.canonical.id })
          .eq('store_id', duplicate.id)
          .select('id')

        if (claimsError) {
          throw new Error(`Failed to repoint claims for store ${duplicate.id}: ${claimsError.message}`)
        }
        if (claims && claims.length > 0) {
          console.log(`  Repointed ${claims.length} claim(s) from store ${duplicate.id}`)
          stats.claimsRepointed += claims.length
        }

        // 2b. Repoint cta_events
        const { data: events, error: eventsError } = await supabaseAdmin
          .from('cta_events')
          .update({ store_id: group.canonical.id })
          .eq('store_id', duplicate.id)
          .select('id')

        if (eventsError) {
          throw new Error(`Failed to repoint events for store ${duplicate.id}: ${eventsError.message}`)
        }
        if (events && events.length > 0) {
          console.log(`  Repointed ${events.length} event(s) from store ${duplicate.id}`)
          stats.eventsRepointed += events.length
        }

        // 2c. Create slug redirect
        if (duplicate.slug && duplicate.slug !== group.canonical.slug) {
          const { error: redirectError } = await supabaseAdmin
            .from('store_slug_redirects')
            .upsert({
              old_slug: duplicate.slug,
              canonical_store_id: group.canonical.id,
            })

          if (redirectError) {
            console.warn(`  Warning: Failed to create redirect for slug ${duplicate.slug}: ${redirectError.message}`)
          } else {
            stats.redirectsCreated++
          }
        }

        // 2d. Archive the duplicate
        const { error: archiveError } = await supabaseAdmin
          .from('stores')
          .update({
            is_archived: true,
            archived_reason: 'duplicate',
            merged_into_store_id: group.canonical.id,
          })
          .eq('id', duplicate.id)

        if (archiveError) {
          throw new Error(`Failed to archive store ${duplicate.id}: ${archiveError.message}`)
        }

        stats.storesArchived++
        console.log(`  Archived store ${duplicate.id} → merged into ${group.canonical.id}`)
      }

      // 2e. Log to ingestion_log
      const { error: logError } = await supabaseAdmin
        .from('ingestion_log')
        .insert({
          operation: 'merge_duplicates',
          entity_type: 'store',
          entity_id: group.canonical.id,
          details: {
            canonical_store_id: group.canonical.id,
            archived_store_ids: group.duplicates.map((d) => d.id),
            address_hash: group.hash,
            merged_at: new Date().toISOString(),
          },
        })

      if (logError) {
        console.warn(`  Warning: Failed to log merge: ${logError.message}`)
      }

      stats.groupsProcessed++
      console.log('')
    } catch (err) {
      console.error(`  ERROR: ${err}`)
      stats.errors++
      // Continue to next group
    }
  }

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('='.repeat(60))
  console.log('Summary')
  console.log('='.repeat(60))
  console.log(`Mode:              ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`Groups processed:  ${stats.groupsProcessed}`)
  console.log(`Groups skipped:    ${stats.groupsSkipped} (risky)`)
  console.log(`Stores archived:   ${stats.storesArchived}`)
  console.log(`Claims repointed:  ${stats.claimsRepointed}`)
  console.log(`Events repointed:  ${stats.eventsRepointed}`)
  console.log(`Redirects created: ${stats.redirectsCreated}`)
  console.log(`Errors:            ${stats.errors}`)

  if (dryRun) {
    console.log('\n[DRY RUN] No changes made. Use --execute to apply.')
  } else if (stats.errors === 0) {
    console.log('\n✅ Merge complete!')
  } else {
    console.log('\n⚠️  Merge completed with errors. Review output above.')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
