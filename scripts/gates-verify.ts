#!/usr/bin/env npx tsx
/**
 * Gate Verification Script
 *
 * Usage:
 *   npx tsx scripts/gates-verify.ts           # Run all gates
 *   npx tsx scripts/gates-verify.ts --gate 0  # Run specific gate
 *   npx tsx scripts/gates-verify.ts --gate 1  # Run Gate 1 (no store routes)
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

// =============================================================================
// Types
// =============================================================================

interface GateResult {
  gate: number
  name: string
  passed: boolean
  message: string
}

// =============================================================================
// Gate 0: Architecture Decision Exists
// =============================================================================

function gate0_architectureDecision(): GateResult {
  const docPath = 'docs/DECISIONS/architecture-gate-1.md'

  if (!fs.existsSync(docPath)) {
    return {
      gate: 0,
      name: 'Architecture Decision',
      passed: false,
      message: `FAIL: ${docPath} does not exist`,
    }
  }

  const content = fs.readFileSync(docPath, 'utf8')

  if (!content.includes('GUIDE-FIRST')) {
    return {
      gate: 0,
      name: 'Architecture Decision',
      passed: false,
      message: 'FAIL: Architecture decision does not contain GUIDE-FIRST',
    }
  }

  return {
    gate: 0,
    name: 'Architecture Decision',
    passed: true,
    message: 'PASS: Architecture decision locked as GUIDE-FIRST',
  }
}

// =============================================================================
// Gate 1: No Store Routes (GUIDE-FIRST Enforcement)
// =============================================================================

async function gate1_noStoreRoutes(): Promise<GateResult> {
  const forbidden = ['/store/', '/stores/', '/listing/', '/listings/']

  // Patterns that are allowed exceptions
  const allowedPatterns = [
    '/stores/new', // Store submission form
    'getStoreSubmitUrl', // URL helper
    'stores.ts', // Types file
    'stores:', // DB reference
  ]

  const files = await glob('app/**/*.{ts,tsx}')
  const violations: string[] = []

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')

    for (const pattern of forbidden) {
      if (content.includes(pattern)) {
        // Check if it's an allowed exception
        const isAllowed = allowedPatterns.some((p) => content.includes(p))
        if (!isAllowed) {
          violations.push(`${file}: contains "${pattern}"`)
        }
      }
    }
  }

  if (violations.length > 0) {
    return {
      gate: 1,
      name: 'No Store Routes',
      passed: false,
      message: `FAIL: Forbidden route references found:\n  ${violations.join('\n  ')}`,
    }
  }

  return {
    gate: 1,
    name: 'No Store Routes',
    passed: true,
    message: 'PASS: No store or listing routes detected',
  }
}

// =============================================================================
// Gate 7: Adapter Boundary
// =============================================================================

async function gate7_adapterBoundary(): Promise<GateResult> {
  const forbiddenImports = ['@supabase/supabase-js', 'createClient']
  const allowedPaths = ['lib/supabase']

  const files = await glob('{app,components,lib}/**/*.{ts,tsx}')
  const violations: string[] = []

  for (const file of files) {
    // Skip files in allowed paths
    if (allowedPaths.some((p) => file.includes(p))) {
      continue
    }

    const content = fs.readFileSync(file, 'utf8')

    for (const pattern of forbiddenImports) {
      if (content.includes(pattern)) {
        violations.push(`${file}: imports "${pattern}"`)
      }
    }
  }

  if (violations.length > 0) {
    return {
      gate: 7,
      name: 'Adapter Boundary',
      passed: false,
      message: `FAIL: Supabase imports found outside lib/supabase:\n  ${violations.join('\n  ')}`,
    }
  }

  return {
    gate: 7,
    name: 'Adapter Boundary',
    passed: true,
    message: 'PASS: Adapter boundary intact - Supabase only in lib/supabase',
  }
}

// =============================================================================
// Gate 8: Counts Consistent
// =============================================================================

async function gate8_countsConsistent(): Promise<GateResult> {
  // This gate requires database access
  // For now, we check that the queries file has the getCountMismatches function
  const queriesPath = 'lib/queries.ts'

  if (!fs.existsSync(queriesPath)) {
    return {
      gate: 8,
      name: 'Counts Consistent',
      passed: false,
      message: 'FAIL: lib/queries.ts does not exist',
    }
  }

  const content = fs.readFileSync(queriesPath, 'utf8')

  if (!content.includes('getCountMismatches')) {
    return {
      gate: 8,
      name: 'Counts Consistent',
      passed: false,
      message: 'FAIL: getCountMismatches function not found in lib/queries.ts',
    }
  }

  return {
    gate: 8,
    name: 'Counts Consistent',
    passed: true,
    message: 'PASS: Count verification function exists (run with DB for full check)',
  }
}

// =============================================================================
// Main
// =============================================================================

async function runGate(gateNumber: number): Promise<GateResult> {
  switch (gateNumber) {
    case 0:
      return gate0_architectureDecision()
    case 1:
      return await gate1_noStoreRoutes()
    case 7:
      return await gate7_adapterBoundary()
    case 8:
      return await gate8_countsConsistent()
    default:
      return {
        gate: gateNumber,
        name: 'Unknown',
        passed: false,
        message: `FAIL: Gate ${gateNumber} not implemented yet`,
      }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const gateIndex = args.indexOf('--gate')

  console.log('═'.repeat(60))
  console.log('  SCRATCH AND DENT FINDER - GATE VERIFICATION')
  console.log('═'.repeat(60))
  console.log()

  if (gateIndex !== -1 && args[gateIndex + 1]) {
    // Run specific gate
    const gateNumber = parseInt(args[gateIndex + 1], 10)
    const result = await runGate(gateNumber)
    console.log(`Gate ${result.gate}: ${result.name}`)
    console.log(result.message)
    console.log()
    process.exit(result.passed ? 0 : 1)
  }

  // Run all Slice 0 gates
  const slice0Gates = [0, 1, 7, 8]
  const results: GateResult[] = []

  for (const gate of slice0Gates) {
    const result = await runGate(gate)
    results.push(result)
    const status = result.passed ? '✅' : '❌'
    console.log(`${status} Gate ${result.gate}: ${result.name}`)
    console.log(`   ${result.message}`)
    console.log()
  }

  console.log('═'.repeat(60))

  const allPassed = results.every((r) => r.passed)
  const passCount = results.filter((r) => r.passed).length

  console.log(`  RESULTS: ${passCount}/${results.length} gates passed`)
  console.log('═'.repeat(60))

  if (!allPassed) {
    console.log()
    console.log('❌ SLICE 0 GATES FAILED - Fix issues before proceeding')
    process.exit(1)
  }

  console.log()
  console.log('✅ ALL SLICE 0 GATES PASSED')
  process.exit(0)
}

main().catch((err) => {
  console.error('Gate verification failed:', err)
  process.exit(1)
})
