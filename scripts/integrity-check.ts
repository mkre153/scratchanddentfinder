#!/usr/bin/env npx tsx
/**
 * Post-Import Integrity Check
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function main() {
  const { supabaseAdmin } = await import('../lib/supabase/admin')

  console.log('═'.repeat(60))
  console.log('  POST-IMPORT INTEGRITY CHECK')
  console.log('═'.repeat(60))
  console.log()

  // 1. Total counts
  const { count: total } = await supabaseAdmin
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .or('is_archived.is.null,is_archived.eq.false')

  const { count: nearmeCount } = await supabaseAdmin
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .eq('batch_id', 'nearme-2026-02')

  const { count: withWebsite } = await supabaseAdmin
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .eq('batch_id', 'nearme-2026-02')
    .not('website', 'is', null)

  console.log('COUNTS')
  console.log('─'.repeat(60))
  console.log('Total active stores:        ', total?.toLocaleString())
  console.log('Nearme batch stores:        ', nearmeCount?.toLocaleString())
  console.log('Nearme with website:        ', withWebsite?.toLocaleString())
  console.log('Pre-import (calculated):    ', ((total || 0) - (nearmeCount || 0)).toLocaleString())
  console.log()

  // 2. Check for orphaned city_id
  const { data: orphanedCity } = await supabaseAdmin
    .from('stores')
    .select('id, name, city_id')
    .eq('batch_id', 'nearme-2026-02')
    .is('city_id', null)

  console.log('ORPHAN CHECK')
  console.log('─'.repeat(60))
  console.log('Stores with null city_id:   ', orphanedCity?.length || 0)

  // 3. Check for orphaned state_id
  const { data: orphanedState } = await supabaseAdmin
    .from('stores')
    .select('id, name, state_id')
    .eq('batch_id', 'nearme-2026-02')
    .is('state_id', null)

  console.log('Stores with null state_id:  ', orphanedState?.length || 0)
  console.log()

  // 4. Sample place_ids
  const { data: samplePlaceIds } = await supabaseAdmin
    .from('stores')
    .select('place_id')
    .eq('batch_id', 'nearme-2026-02')
    .limit(5)

  console.log('SAMPLE PLACE_IDS (should be nearme_* format)')
  console.log('─'.repeat(60))
  for (const s of samplePlaceIds || []) {
    console.log(' ', s.place_id)
  }
  console.log()

  // 5. New cities created
  const { count: totalCities } = await supabaseAdmin
    .from('cities')
    .select('*', { count: 'exact', head: true })

  console.log('CITIES')
  console.log('─'.repeat(60))
  console.log('Total cities in DB:         ', totalCities?.toLocaleString())
  console.log()

  // 6. Sample stores with data quality check
  const { data: samples } = await supabaseAdmin
    .from('stores')
    .select('name, address, phone, website, city:cities(name), state:states(name)')
    .eq('batch_id', 'nearme-2026-02')
    .not('website', 'is', null)
    .limit(5)

  console.log('SAMPLE STORES (with enriched website)')
  console.log('─'.repeat(60))
  for (const s of samples || []) {
    const city = s.city as { name: string } | null
    const state = s.state as { name: string } | null
    console.log('  ' + s.name)
    console.log('    ' + s.address)
    console.log('    ' + city?.name + ', ' + state?.name)
    console.log('    ' + s.website)
    console.log()
  }

  // 7. Source distribution
  const { data: sources } = await supabaseAdmin
    .from('stores')
    .select('source')
    .or('is_archived.is.null,is_archived.eq.false')

  const sourceCounts: Record<string, number> = {}
  for (const s of sources || []) {
    const src = s.source || 'null'
    sourceCounts[src] = (sourceCounts[src] || 0) + 1
  }

  console.log('SOURCE DISTRIBUTION')
  console.log('─'.repeat(60))
  for (const [src, count] of Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])) {
    console.log('  ' + src.padEnd(20), count.toLocaleString())
  }

  console.log()
  console.log('═'.repeat(60))
  console.log('  INTEGRITY CHECK COMPLETE')
  console.log('═'.repeat(60))
}

main().catch((err) => {
  console.error('Check failed:', err)
  process.exit(1)
})
