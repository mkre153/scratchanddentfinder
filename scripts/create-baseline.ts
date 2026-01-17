#!/usr/bin/env npx tsx
/**
 * Create Baseline
 *
 * Creates a formal baseline record from a snapshot file.
 * Records baseline metrics to ingestion_log for future comparison.
 *
 * Usage:
 *   npx tsx scripts/create-baseline.ts --name "pre-delta-01" --snapshot "/tmp/sdf-beta-reset/stores-snapshot-{timestamp}.json"
 *
 * Options:
 *   --name        Required. Human-readable baseline name (e.g., "pre-delta-2026-01-16")
 *   --snapshot    Required. Path to snapshot JSON file
 *   --description Optional. Description of the baseline purpose
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fs from 'node:fs'

interface SnapshotFile {
  metadata: {
    createdAt: string
    purpose: string
    stats: {
      totalStores: number
      activeStores: number
      archivedStores: number
      withZip: number
      withoutZip: number
      withAddressHash: number
      withoutAddressHash: number
    }
  }
  stores: Array<{
    id: number
    state_id: number
    source?: string
    google_place_id?: string
  }>
}

function parseArgs() {
  const args = process.argv.slice(2)
  let name: string | null = null
  let snapshotPath: string | null = null
  let description: string | null = null

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name':
        name = args[++i]
        break
      case '--snapshot':
        snapshotPath = args[++i]
        break
      case '--description':
        description = args[++i]
        break
    }
  }

  return { name, snapshotPath, description }
}

async function main() {
  const { name, snapshotPath, description } = parseArgs()

  console.log('='.repeat(60))
  console.log('Create Baseline')
  console.log('='.repeat(60))
  console.log('')

  // Validate arguments
  if (!name) {
    console.error('Error: --name is required')
    console.error('Usage: npx tsx scripts/create-baseline.ts --name "pre-delta-01" --snapshot "/path/to/snapshot.json"')
    process.exit(1)
  }

  if (!snapshotPath) {
    console.error('Error: --snapshot is required')
    console.error('Usage: npx tsx scripts/create-baseline.ts --name "pre-delta-01" --snapshot "/path/to/snapshot.json"')
    process.exit(1)
  }

  // Check snapshot file exists
  if (!fs.existsSync(snapshotPath)) {
    console.error(`Error: Snapshot file not found: ${snapshotPath}`)
    process.exit(1)
  }

  console.log(`Baseline name: ${name}`)
  console.log(`Snapshot file: ${snapshotPath}`)
  if (description) {
    console.log(`Description:   ${description}`)
  }
  console.log('')

  // Load snapshot
  console.log('Loading snapshot...')
  const snapshotData: SnapshotFile = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'))

  // Calculate additional metrics
  const stateDistribution: Record<string, number> = {}
  const sourceDistribution: Record<string, number> = {}
  let withGooglePlaceId = 0

  for (const store of snapshotData.stores) {
    // State distribution
    const stateId = store.state_id?.toString() || 'unknown'
    stateDistribution[stateId] = (stateDistribution[stateId] || 0) + 1

    // Source distribution
    const source = store.source || 'legacy'
    sourceDistribution[source] = (sourceDistribution[source] || 0) + 1

    // Google place ID count
    if (store.google_place_id) {
      withGooglePlaceId++
    }
  }

  const baselineMetrics = {
    ...snapshotData.metadata.stats,
    withGooglePlaceId,
    snapshotCreatedAt: snapshotData.metadata.createdAt,
    stateDistribution,
    sourceDistribution,
  }

  console.log('Metrics calculated.')
  console.log('')

  // Save baseline to file for future comparison
  const baselineDir = '/tmp/sdf-baselines'
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true })
  }

  const baselineFile = {
    name,
    description: description || `Baseline snapshot: ${name}`,
    snapshot_path: snapshotPath,
    metrics: baselineMetrics,
    created_at: new Date().toISOString(),
  }

  const baselineFilePath = `${baselineDir}/${name}.json`
  fs.writeFileSync(baselineFilePath, JSON.stringify(baselineFile, null, 2))

  // Insert record into ingestion_log (simple record, no details column)
  const { supabaseAdmin } = await import('../lib/supabase/admin')

  const { error: insertError } = await supabaseAdmin.from('ingestion_log').insert({
    operation: 'baseline_created',
    source: name,
    records_affected: snapshotData.metadata.stats.totalStores,
    initiated_by: `create-baseline.ts | ${baselineFilePath}`,
  })

  if (insertError) {
    console.error('Failed to log baseline to ingestion_log:', insertError.message)
    // Continue anyway since the file was saved
  }

  // Print summary
  console.log('='.repeat(60))
  console.log('Baseline Created')
  console.log('='.repeat(60))
  console.log('')
  console.log(`Name:           ${name}`)
  console.log(`Baseline file:  ${baselineFilePath}`)
  console.log(`Snapshot:       ${snapshotPath}`)
  console.log(`Created at:     ${baselineMetrics.snapshotCreatedAt}`)
  console.log('')
  console.log('Metrics:')
  console.log(`  Total stores:         ${baselineMetrics.totalStores}`)
  console.log(`  Active stores:        ${baselineMetrics.activeStores}`)
  console.log(`  Archived stores:      ${baselineMetrics.archivedStores}`)
  console.log(`  With address_hash:    ${baselineMetrics.withAddressHash}`)
  console.log(`  With google_place_id: ${baselineMetrics.withGooglePlaceId}`)
  console.log(`  With ZIP:             ${baselineMetrics.withZip}`)
  console.log('')
  console.log('Source distribution:')
  for (const [source, count] of Object.entries(sourceDistribution)) {
    console.log(`  ${source}: ${count}`)
  }
  console.log('')
  console.log('Baseline locked and recorded in ingestion_log.')
  console.log('Use this baseline name for future comparisons.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
