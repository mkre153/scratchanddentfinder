#!/usr/bin/env npx tsx
/**
 * Counts Recompute Script
 *
 * Slice 0 (Backfill): Recomputes store_count and city_count for all cities and states.
 * Ensures Gate 8 (Counts Consistent) passes after data imports.
 *
 * Usage:
 *   npx tsx scripts/counts-recompute.ts
 *   npx tsx scripts/counts-recompute.ts --dry-run
 */

import { supabaseAdmin } from '../lib/supabase/admin'

const isDryRun = process.argv.includes('--dry-run')

async function recomputeCounts(): Promise<void> {
  console.log('Recomputing store_count and city_count...')
  if (isDryRun) {
    console.log('(DRY RUN - no changes will be made)')
  }
  console.log()

  let cityUpdates = 0
  let stateStoreUpdates = 0
  let stateCityUpdates = 0

  // ==========================================================================
  // Step 1: Recompute city.store_count
  // ==========================================================================
  console.log('Step 1: Recomputing city store counts...')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cities, error: citiesError } = await (supabaseAdmin as any)
    .from('cities')
    .select('id, name, store_count')

  if (citiesError) throw citiesError

  for (const city of cities ?? []) {
    // Count approved stores in this city
    const { count, error: countError } = await supabaseAdmin
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', city.id)
      .eq('is_approved', true)

    if (countError) throw countError

    const actualCount = count ?? 0

    if (actualCount !== city.store_count) {
      console.log(`  City ${city.name}: ${city.store_count} -> ${actualCount}`)

      if (!isDryRun) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabaseAdmin as any)
          .from('cities')
          .update({ store_count: actualCount })
          .eq('id', city.id)

        if (updateError) throw updateError
      }
      cityUpdates++
    }
  }

  console.log(`  Updated ${cityUpdates} city store counts`)
  console.log()

  // ==========================================================================
  // Step 2: Recompute state.store_count
  // ==========================================================================
  console.log('Step 2: Recomputing state store counts...')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: states, error: statesError } = await (supabaseAdmin as any)
    .from('states')
    .select('id, name, store_count, city_count')

  if (statesError) throw statesError

  for (const state of states ?? []) {
    // Count approved stores in this state
    const { count: storeCount, error: storeCountError } = await supabaseAdmin
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('state_id', state.id)
      .eq('is_approved', true)

    if (storeCountError) throw storeCountError

    const actualStoreCount = storeCount ?? 0

    if (actualStoreCount !== state.store_count) {
      console.log(`  State ${state.name} stores: ${state.store_count} -> ${actualStoreCount}`)

      if (!isDryRun) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabaseAdmin as any)
          .from('states')
          .update({ store_count: actualStoreCount })
          .eq('id', state.id)

        if (updateError) throw updateError
      }
      stateStoreUpdates++
    }
  }

  console.log(`  Updated ${stateStoreUpdates} state store counts`)
  console.log()

  // ==========================================================================
  // Step 3: Recompute state.city_count
  // ==========================================================================
  console.log('Step 3: Recomputing state city counts...')

  for (const state of states ?? []) {
    // Count cities in this state
    const { count: cityCount, error: cityCountError } = await supabaseAdmin
      .from('cities')
      .select('*', { count: 'exact', head: true })
      .eq('state_id', state.id)

    if (cityCountError) throw cityCountError

    const actualCityCount = cityCount ?? 0

    if (actualCityCount !== state.city_count) {
      console.log(`  State ${state.name} cities: ${state.city_count} -> ${actualCityCount}`)

      if (!isDryRun) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabaseAdmin as any)
          .from('states')
          .update({ city_count: actualCityCount })
          .eq('id', state.id)

        if (updateError) throw updateError
      }
      stateCityUpdates++
    }
  }

  console.log(`  Updated ${stateCityUpdates} state city counts`)
  console.log()

  // ==========================================================================
  // Summary
  // ==========================================================================
  console.log('═'.repeat(50))
  console.log('  SUMMARY')
  console.log('═'.repeat(50))
  console.log(`  City store_count updates:  ${cityUpdates}`)
  console.log(`  State store_count updates: ${stateStoreUpdates}`)
  console.log(`  State city_count updates:  ${stateCityUpdates}`)
  console.log('═'.repeat(50))

  if (isDryRun) {
    console.log()
    console.log('(DRY RUN complete - no changes were made)')
  } else if (cityUpdates === 0 && stateStoreUpdates === 0 && stateCityUpdates === 0) {
    console.log()
    console.log('All counts are already correct!')
  } else {
    console.log()
    console.log('Counts recomputed successfully.')
  }
}

recomputeCounts().catch((err) => {
  console.error('Counts recompute failed:', err)
  process.exit(1)
})
