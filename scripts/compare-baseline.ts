#!/usr/bin/env npx tsx
/**
 * Compare Baseline
 *
 * Compares current database state against a named baseline.
 * Shows delta: stores added, new cities, state distribution changes.
 *
 * Usage:
 *   npx tsx scripts/compare-baseline.ts --baseline "pre-delta-2026-01-16"
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fs from 'node:fs'

interface BaselineFile {
  name: string
  description: string
  snapshot_path: string
  metrics: {
    totalStores: number
    activeStores: number
    archivedStores: number
    withZip: number
    withoutZip: number
    withAddressHash: number
    withoutAddressHash: number
    withGooglePlaceId: number
    snapshotCreatedAt: string
    sourceDistribution: Record<string, number>
  }
  created_at: string
}

function parseArgs() {
  const args = process.argv.slice(2)
  let baselineName: string | null = null

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--baseline':
        baselineName = args[++i]
        break
    }
  }

  return { baselineName }
}

async function main() {
  const { baselineName } = parseArgs()

  console.log('═'.repeat(60))
  console.log('  BASELINE COMPARISON')
  console.log('═'.repeat(60))

  if (!baselineName) {
    console.error('Error: --baseline is required')
    console.error('Usage: npx tsx scripts/compare-baseline.ts --baseline "pre-delta-2026-01-16"')
    process.exit(1)
  }

  // Load baseline file
  const baselineDir = '/tmp/sdf-baselines'
  const baselineFilePath = `${baselineDir}/${baselineName}.json`

  if (!fs.existsSync(baselineFilePath)) {
    console.error(`Error: Baseline not found: ${baselineFilePath}`)
    console.log('')
    console.log('Available baselines:')
    if (fs.existsSync(baselineDir)) {
      const files = fs.readdirSync(baselineDir).filter(f => f.endsWith('.json'))
      for (const file of files) {
        console.log(`  - ${file.replace('.json', '')}`)
      }
    }
    process.exit(1)
  }

  const baseline: BaselineFile = JSON.parse(fs.readFileSync(baselineFilePath, 'utf-8'))

  console.log(`  Baseline: ${baseline.name}`)
  console.log(`  Created:  ${baseline.created_at}`)
  console.log('═'.repeat(60))
  console.log('')

  // Get current database state
  const { supabaseAdmin } = await import('../lib/supabase/admin')

  console.log('Fetching current database state...')

  // Fetch current counts
  const PAGE_SIZE = 1000
  let allStores: any[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from('stores')
      .select('id, is_archived, address_hash, google_place_id, zip, source, batch_id, state_id')
      .order('id')
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.error('Failed to fetch stores:', error.message)
      process.exit(1)
    }

    if (data && data.length > 0) {
      allStores.push(...data)
      offset += PAGE_SIZE
      hasMore = data.length === PAGE_SIZE
    } else {
      hasMore = false
    }
  }

  // Calculate current metrics
  const current = {
    totalStores: allStores.length,
    activeStores: allStores.filter(s => !s.is_archived).length,
    archivedStores: allStores.filter(s => s.is_archived).length,
    withAddressHash: allStores.filter(s => s.address_hash).length,
    withGooglePlaceId: allStores.filter(s => s.google_place_id).length,
    withZip: allStores.filter(s => s.zip).length,
  }

  // Calculate source distribution
  const sourceDistribution: Record<string, number> = {}
  for (const store of allStores) {
    const source = store.source || 'legacy'
    sourceDistribution[source] = (sourceDistribution[source] || 0) + 1
  }

  // Find new batch IDs since baseline
  const newBatches: Record<string, number> = {}
  for (const store of allStores) {
    if (store.batch_id && store.batch_id.includes('delta')) {
      newBatches[store.batch_id] = (newBatches[store.batch_id] || 0) + 1
    }
  }

  // Print comparison
  console.log('─'.repeat(60))
  console.log('METRICS COMPARISON')
  console.log('─'.repeat(60))
  console.log('')
  console.log('                        Baseline    Current     Delta')
  console.log(`  Total stores:         ${baseline.metrics.totalStores.toString().padStart(8)}    ${current.totalStores.toString().padStart(8)}    ${formatDelta(current.totalStores - baseline.metrics.totalStores)}`)
  console.log(`  Active stores:        ${baseline.metrics.activeStores.toString().padStart(8)}    ${current.activeStores.toString().padStart(8)}    ${formatDelta(current.activeStores - baseline.metrics.activeStores)}`)
  console.log(`  Archived stores:      ${baseline.metrics.archivedStores.toString().padStart(8)}    ${current.archivedStores.toString().padStart(8)}    ${formatDelta(current.archivedStores - baseline.metrics.archivedStores)}`)
  console.log(`  With address_hash:    ${baseline.metrics.withAddressHash.toString().padStart(8)}    ${current.withAddressHash.toString().padStart(8)}    ${formatDelta(current.withAddressHash - baseline.metrics.withAddressHash)}`)
  console.log(`  With google_place_id: ${baseline.metrics.withGooglePlaceId.toString().padStart(8)}    ${current.withGooglePlaceId.toString().padStart(8)}    ${formatDelta(current.withGooglePlaceId - baseline.metrics.withGooglePlaceId)}`)
  console.log(`  With ZIP:             ${baseline.metrics.withZip.toString().padStart(8)}    ${current.withZip.toString().padStart(8)}    ${formatDelta(current.withZip - baseline.metrics.withZip)}`)
  console.log('')

  // New batches since baseline
  if (Object.keys(newBatches).length > 0) {
    console.log('─'.repeat(60))
    console.log('NEW RECORDS SINCE BASELINE')
    console.log('─'.repeat(60))
    console.log('')
    for (const [batchId, count] of Object.entries(newBatches)) {
      console.log(`  Batch: ${batchId}`)
      console.log(`  Records: ${count}`)
    }
    console.log('')
  }

  // Source distribution changes
  console.log('─'.repeat(60))
  console.log('SOURCE DISTRIBUTION')
  console.log('─'.repeat(60))
  console.log('')
  console.log('                    Baseline    Current     Delta')
  const allSources = new Set([
    ...Object.keys(baseline.metrics.sourceDistribution || {}),
    ...Object.keys(sourceDistribution)
  ])
  for (const source of allSources) {
    const baselineCount = baseline.metrics.sourceDistribution?.[source] || 0
    const currentCount = sourceDistribution[source] || 0
    console.log(`  ${source.padEnd(16)}  ${baselineCount.toString().padStart(8)}    ${currentCount.toString().padStart(8)}    ${formatDelta(currentCount - baselineCount)}`)
  }
  console.log('')

  // Summary
  console.log('═'.repeat(60))
  console.log('  SUMMARY')
  console.log('═'.repeat(60))
  const totalDelta = current.totalStores - baseline.metrics.totalStores
  console.log(`  Stores added since baseline: ${totalDelta}`)
  console.log(`  Baseline was created: ${baseline.created_at}`)
  console.log('═'.repeat(60))
}

function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`.padStart(6)
  if (delta < 0) return `${delta}`.padStart(6)
  return '     0'
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
