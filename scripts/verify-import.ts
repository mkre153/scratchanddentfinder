/**
 * Phase 1 Verification Script
 * Checks import integrity: counts, duplicates, NULLs, orphans
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  console.log('═'.repeat(60))
  console.log('  PHASE 1 VERIFICATION')
  console.log('═'.repeat(60))

  // 1. Total store count
  const { count: totalStores } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })
  console.log(`\n✓ Total stores: ${totalStores}`)

  // 2. Stores from each batch
  const batchIds = ['sdf-batch-00-2026-01-15', 'sdf-batch-01-2026-01-15', 'sdf-batch-04-2026-01-15']
  let batchTotal = 0
  for (const batchId of batchIds) {
    const { count } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('batch_id', batchId)
    console.log(`  - ${batchId}: ${count}`)
    batchTotal += count || 0
  }
  console.log(`  → Today's import total: ${batchTotal}`)

  // 3. Check for duplicate google_place_ids (using raw SQL via RPC or manual check)
  const { data: allStores } = await supabase
    .from('stores')
    .select('google_place_id')
    .not('google_place_id', 'is', null)

  if (allStores) {
    const placeIds = allStores.map(s => s.google_place_id)
    const uniqueIds = new Set(placeIds)
    const dupeCount = placeIds.length - uniqueIds.size
    if (dupeCount > 0) {
      console.log(`\n✗ Duplicate google_place_ids: ${dupeCount}`)
    } else {
      console.log(`\n✓ No duplicate google_place_ids (${uniqueIds.size} unique)`)
    }
  }

  // 4. Check for NULL required fields
  const { count: nullName } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .is('name', null)

  const { count: nullCity } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .is('city_id', null)

  const { count: nullState } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .is('state_id', null)

  const { count: nullPlaceId } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .is('google_place_id', null)

  console.log(`\n✓ NULL check:`)
  console.log(`  - name IS NULL: ${nullName || 0}`)
  console.log(`  - city_id IS NULL: ${nullCity || 0}`)
  console.log(`  - state_id IS NULL: ${nullState || 0}`)
  console.log(`  - google_place_id IS NULL: ${nullPlaceId || 0}`)

  const hasNulls = (nullName || 0) + (nullCity || 0) + (nullState || 0) + (nullPlaceId || 0) > 0
  if (hasNulls) {
    console.log(`  ⚠ WARNING: Found NULL values in required fields`)
  }

  // 5. Check for orphaned cities (cities with no stores)
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name, state_id')

  const { data: storesWithCity } = await supabase
    .from('stores')
    .select('city_id')

  if (cities && storesWithCity) {
    const usedCityIds = new Set(storesWithCity.map(s => s.city_id))
    const orphanedCities = cities.filter(c => !usedCityIds.has(c.id))

    if (orphanedCities.length > 0) {
      console.log(`\n⚠ Orphaned cities (no stores): ${orphanedCities.length}`)
      // Just show count, not all of them
    } else {
      console.log(`\n✓ No orphaned cities`)
    }
  }

  // 6. State distribution for today's imports
  console.log(`\n📊 State distribution (today's imports):`)
  const { data: stateDistribution } = await supabase
    .from('stores')
    .select('state_id, states(code)')
    .in('batch_id', batchIds)

  if (stateDistribution) {
    const stateCounts: Record<string, number> = {}
    stateDistribution.forEach((s: any) => {
      const code = s.states?.code || 'Unknown'
      stateCounts[code] = (stateCounts[code] || 0) + 1
    })

    // Sort by count descending
    const sorted = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])
    sorted.slice(0, 10).forEach(([state, count]) => {
      console.log(`  - ${state}: ${count}`)
    })
    if (sorted.length > 10) {
      console.log(`  ... and ${sorted.length - 10} more states`)
    }
  }

  console.log(`\n` + '═'.repeat(60))
  console.log(`  VERIFICATION COMPLETE`)
  console.log('═'.repeat(60))
}

verify().catch(err => {
  console.error('Verification failed:', err)
  process.exit(1)
})
