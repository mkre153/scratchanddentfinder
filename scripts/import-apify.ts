#!/usr/bin/env npx tsx
/**
 * Apify Import Script
 *
 * Slice 0 (Backfill): Imports store data from compass/crawler-google-places JSON export.
 * Foundational, deterministic, boring.
 *
 * Usage:
 *   npx tsx scripts/import-apify.ts data.json
 *   npx tsx scripts/import-apify.ts data.json --dry-run
 *
 * Expected JSON Schema (compass/crawler-google-places):
 * [
 *   {
 *     "title": "Store Name",
 *     "street": "123 Main St",
 *     "city": "San Diego",
 *     "state": "California",
 *     "countryCode": "US",
 *     "phone": "(858) 555-1234",
 *     "website": "https://...",
 *     "totalScore": 4.5,
 *     "reviewsCount": 127,
 *     "categoryName": "Appliance store",
 *     "url": "https://www.google.com/maps/search/?api=1&query=...&query_place_id=ChIJ..."
 *   }
 * ]
 *
 * NOTE: This script delegates all store/city creation to the ingestion boundary.
 * Gate 16 enforces that stores/cities can ONLY be created through lib/ingestion/.
 */

import * as fs from 'fs'
import * as path from 'path'
import { ingestStoresFromApify } from '../lib/ingestion'
import type { ApifyPlace } from '../lib/ingestion'

// =============================================================================
// Main Import Function
// =============================================================================

async function importApifyData(filePath: string, isDryRun: boolean): Promise<void> {
  console.log(`Importing from: ${filePath}`)
  if (isDryRun) {
    console.log('(DRY RUN - no changes will be made)')
  }
  console.log()

  // Load and parse JSON file
  const absolutePath = path.resolve(filePath)
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`)
  }

  const rawData = fs.readFileSync(absolutePath, 'utf8')
  const places: ApifyPlace[] = JSON.parse(rawData)

  if (!Array.isArray(places)) {
    throw new Error('JSON file must contain an array of places')
  }

  console.log(`Found ${places.length} places to process`)
  console.log()

  // Delegate to ingestion boundary
  const sourceFile = path.basename(filePath)
  const result = await ingestStoresFromApify(places, sourceFile, isDryRun)

  // Print summary
  console.log()
  console.log('═'.repeat(50))
  console.log('  IMPORT SUMMARY')
  console.log('═'.repeat(50))
  console.log(`  Processed: ${places.length}`)
  console.log(`  Inserted:  ${result.created}`)
  console.log(`  Updated:   ${result.updated}`)
  console.log(`  Skipped:   ${result.skipped}`)
  console.log(`  Errors:    ${result.errors}`)
  console.log('═'.repeat(50))

  if (isDryRun) {
    console.log()
    console.log('(DRY RUN complete - no changes were made)')
  } else if (result.created > 0 || result.updated > 0) {
    console.log()
    console.log('Run `npx tsx scripts/counts-recompute.ts` to update store counts.')
  }

  if (result.errors > 0) {
    process.exit(1)
  }
}

// =============================================================================
// CLI Entry Point
// =============================================================================

const args = process.argv.slice(2)
const filePath = args.find((arg) => !arg.startsWith('--'))
const isDryRun = args.includes('--dry-run')

if (!filePath) {
  console.error('Usage: npx tsx scripts/import-apify.ts <file.json> [--dry-run]')
  console.error()
  console.error('Imports data from compass/crawler-google-places Apify actor.')
  console.error()
  console.error('Options:')
  console.error('  --dry-run    Preview changes without writing to database')
  process.exit(1)
}

importApifyData(filePath, isDryRun).catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
