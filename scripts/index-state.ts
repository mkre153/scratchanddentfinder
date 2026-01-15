#!/usr/bin/env npx tsx
/**
 * Index State Script
 *
 * Updates store_count for a specific state and its cities.
 * Used for selective rollout of new data.
 *
 * Usage:
 *   npx tsx scripts/index-state.ts California
 *   npx tsx scripts/index-state.ts Texas
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const stateName = process.argv[2]

if (!stateName) {
  console.error('Usage: npx tsx scripts/index-state.ts <StateName>')
  console.error('Example: npx tsx scripts/index-state.ts California')
  process.exit(1)
}

async function indexState(name: string): Promise<void> {
  console.log('═'.repeat(50))
  console.log(`  INDEXING: ${name}`)
  console.log('═'.repeat(50))

  // Get state
  const { data: state, error: stateErr } = await supabase
    .from('states')
    .select('id, name, store_count, city_count')
    .eq('name', name)
    .single()

  if (stateErr || !state) {
    console.error('State not found:', stateErr?.message || 'Unknown error')
    process.exit(1)
  }

  console.log(`State ID: ${state.id}`)
  console.log(`Current store_count: ${state.store_count}`)
  console.log(`Current city_count: ${state.city_count}`)

  // Get all cities in this state
  const { data: cities, error: citiesErr } = await supabase
    .from('cities')
    .select('id, name, store_count')
    .eq('state_id', state.id)

  if (citiesErr) {
    console.error('Failed to fetch cities:', citiesErr.message)
    process.exit(1)
  }

  console.log(`\nUpdating ${cities?.length || 0} cities...`)

  let cityUpdates = 0
  let totalStoresInCities = 0

  for (const city of cities || []) {
    // Count approved stores in this city
    const { count, error: countErr } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', city.id)
      .eq('is_approved', true)

    if (countErr) {
      console.error(`  Error counting stores for ${city.name}:`, countErr.message)
      continue
    }

    const actualCount = count || 0
    totalStoresInCities += actualCount

    if (actualCount !== city.store_count) {
      console.log(`  ${city.name}: ${city.store_count} -> ${actualCount}`)

      const { error: updateErr } = await supabase
        .from('cities')
        .update({ store_count: actualCount })
        .eq('id', city.id)

      if (updateErr) {
        console.error(`  Failed to update ${city.name}:`, updateErr.message)
      } else {
        cityUpdates++
      }
    }
  }

  // Update state store_count and city_count
  const { count: stateStoreCount, error: stateCountErr } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .eq('state_id', state.id)
    .eq('is_approved', true)

  if (stateCountErr) {
    console.error('Failed to count state stores:', stateCountErr.message)
    process.exit(1)
  }

  const actualStoreCount = stateStoreCount || 0
  const actualCityCount = cities?.length || 0

  console.log(`\nState totals:`)
  console.log(`  store_count: ${state.store_count} -> ${actualStoreCount}`)
  console.log(`  city_count: ${state.city_count} -> ${actualCityCount}`)

  const { error: stateUpdateErr } = await supabase
    .from('states')
    .update({
      store_count: actualStoreCount,
      city_count: actualCityCount
    })
    .eq('id', state.id)

  if (stateUpdateErr) {
    console.error('Failed to update state:', stateUpdateErr.message)
    process.exit(1)
  }

  console.log()
  console.log('═'.repeat(50))
  console.log(`  ✓ Updated ${cityUpdates} city counts`)
  console.log(`  ✓ State now has ${actualStoreCount} stores in ${actualCityCount} cities`)
  console.log('═'.repeat(50))
}

indexState(stateName).catch((err) => {
  console.error('Index state failed:', err)
  process.exit(1)
})
