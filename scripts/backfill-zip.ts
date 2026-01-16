#!/usr/bin/env npx tsx
/**
 * Backfill ZIP Codes from Address Strings
 *
 * Extracts ZIP codes embedded in address strings and populates
 * the zip column for existing stores.
 *
 * Usage:
 *   npx tsx scripts/backfill-zip.ts [--dry-run]
 *
 * Options:
 *   --dry-run    Preview changes without writing to database
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { extractZipFromAddress } from '../lib/utils/address-normalizer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface Store {
  id: number
  name: string
  address: string
  zip: string | null
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  console.log('═'.repeat(60))
  console.log('  BACKFILL ZIP CODES')
  console.log('═'.repeat(60))
  console.log(`  Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log('═'.repeat(60))
  console.log()

  // Fetch all stores where zip is null
  console.log('📥 Fetching stores with null zip...')
  const { data: stores, error } = await supabase
    .from('stores')
    .select('id, name, address, zip')
    .is('zip', null)
    .order('id')

  if (error) {
    console.error('Error fetching stores:', error)
    process.exit(1)
  }

  console.log(`   Found ${stores?.length ?? 0} stores with null zip`)
  console.log()

  if (!stores || stores.length === 0) {
    console.log('✅ No stores need updating')
    return
  }

  // Process each store
  let updated = 0
  let noZipFound = 0
  let errors = 0

  for (const store of stores as Store[]) {
    const extractedZip = extractZipFromAddress(store.address)

    if (!extractedZip) {
      noZipFound++
      continue
    }

    if (dryRun) {
      console.log(`   [DRY RUN] ${store.name}: "${store.address}" → ZIP: ${extractedZip}`)
      updated++
      continue
    }

    // Update the store
    const { error: updateError } = await supabase
      .from('stores')
      .update({ zip: extractedZip })
      .eq('id', store.id)

    if (updateError) {
      console.error(`   ERROR updating ${store.name}:`, updateError.message)
      errors++
      continue
    }

    console.log(`   ✓ ${store.name}: ${extractedZip}`)
    updated++
  }

  // Summary
  console.log()
  console.log('═'.repeat(60))
  console.log('  RESULTS')
  console.log('═'.repeat(60))
  console.log(`  Total processed:   ${stores.length}`)
  console.log(`  ZIP extracted:     ${updated}`)
  console.log(`  No ZIP in address: ${noZipFound}`)
  console.log(`  Errors:            ${errors}`)
  console.log('═'.repeat(60))

  if (dryRun && updated > 0) {
    console.log()
    console.log('💡 Run without --dry-run to apply changes')
  }
}

main().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
