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
// Gate 2: No Forms on Directory Pages (PARITY_MODE)
// =============================================================================

async function gate2_noFormsOnDirectoryPages(): Promise<GateResult> {
  const directoryPaths = [
    'app/page.tsx',
    'app/scratch-and-dent-appliances/page.tsx',
    'app/scratch-and-dent-appliances/[state]/page.tsx',
    'app/scratch-and-dent-appliances/[state]/[city]/page.tsx',
  ]

  const violations: string[] = []

  for (const filePath of directoryPaths) {
    if (!fs.existsSync(filePath)) continue

    const content = fs.readFileSync(filePath, 'utf8')

    // Check for <form elements
    if (content.includes('<form') || content.includes('<Form')) {
      violations.push(`${filePath}: contains form element`)
    }
  }

  if (violations.length > 0) {
    return {
      gate: 2,
      name: 'No Forms (Parity)',
      passed: false,
      message: `FAIL: Form elements found on directory pages:\\n  ${violations.join('\\n  ')}`,
    }
  }

  return {
    gate: 2,
    name: 'No Forms (Parity)',
    passed: true,
    message: 'PASS: No form elements on directory pages',
  }
}

// =============================================================================
// Gate 3: Absolute Canonicals + Trailing Slash
// =============================================================================

async function gate3_canonicalsAndTrailingSlash(): Promise<GateResult> {
  const violations: string[] = []

  // Check lib/urls.ts - all paths must end with /
  const urlsPath = 'lib/urls.ts'
  if (fs.existsSync(urlsPath)) {
    const content = fs.readFileSync(urlsPath, 'utf8')

    // Find all return statements with paths
    const pathMatches = content.match(/return ['"`][^'"`]+['"`]/g) || []

    for (const match of pathMatches) {
      const pathContent = match.replace(/return ['"`]/, '').replace(/['"`]$/, '')
      // Skip template literals and empty strings
      if (pathContent.includes('${') || pathContent === '') continue
      // Check trailing slash (except for root /)
      if (pathContent !== '/' && !pathContent.endsWith('/')) {
        violations.push(`lib/urls.ts: path "${pathContent}" missing trailing slash`)
      }
    }
  }

  // Check next.config for trailingSlash
  const nextConfigPaths = ['next.config.ts', 'next.config.js', 'next.config.mjs']
  let hasTrailingSlashConfig = false

  for (const configPath of nextConfigPaths) {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8')
      if (content.includes('trailingSlash: true') || content.includes('trailingSlash:true')) {
        hasTrailingSlashConfig = true
        break
      }
    }
  }

  if (!hasTrailingSlashConfig) {
    violations.push('next.config: trailingSlash: true not found')
  }

  if (violations.length > 0) {
    return {
      gate: 3,
      name: 'Canonicals + Trailing Slash',
      passed: false,
      message: `FAIL: Canonical/trailing slash issues:\\n  ${violations.join('\\n  ')}`,
    }
  }

  return {
    gate: 3,
    name: 'Canonicals + Trailing Slash',
    passed: true,
    message: 'PASS: All URLs have trailing slashes and config is correct',
  }
}

// =============================================================================
// Gate 5: Route Strings ONLY in lib/urls.ts
// =============================================================================

async function gate5_routesOnlyInUrls(): Promise<GateResult> {
  const routePattern = /scratch-and-dent-appliances/
  const allowedFiles = ['lib/urls.ts']

  const files = await glob('{app,components,lib}/**/*.{ts,tsx}')
  const violations: string[] = []

  for (const file of files) {
    // Skip allowed files
    if (allowedFiles.some((allowed) => file.endsWith(allowed))) {
      continue
    }

    const content = fs.readFileSync(file, 'utf8')

    // Check for hardcoded route strings
    // Match strings containing the route pattern
    const matches = content.match(/['"`][^'"`]*scratch-and-dent-appliances[^'"`]*['"`]/g)

    if (matches) {
      for (const match of matches) {
        // Skip if it's inside a comment
        const lineIndex = content.indexOf(match)
        const lineStart = content.lastIndexOf('\n', lineIndex) + 1
        const lineContent = content.slice(lineStart, content.indexOf('\n', lineIndex))

        if (lineContent.trim().startsWith('//') || lineContent.trim().startsWith('*')) {
          continue
        }

        violations.push(`${file}: contains hardcoded route "${match}"`)
      }
    }
  }

  if (violations.length > 0) {
    return {
      gate: 5,
      name: 'Routes in urls.ts Only',
      passed: false,
      message: `FAIL: Hardcoded routes found outside lib/urls.ts:\\n  ${violations.join('\\n  ')}`,
    }
  }

  return {
    gate: 5,
    name: 'Routes in urls.ts Only',
    passed: true,
    message: 'PASS: All route strings are in lib/urls.ts',
  }
}

// =============================================================================
// Gate 6: Sitemap Works
// =============================================================================

async function gate6_sitemapWorks(): Promise<GateResult> {
  // Check that sitemap file exists
  const sitemapPath = 'app/sitemap.ts'

  if (!fs.existsSync(sitemapPath)) {
    return {
      gate: 6,
      name: 'Sitemaps Work',
      passed: false,
      message: 'FAIL: app/sitemap.ts does not exist',
    }
  }

  const content = fs.readFileSync(sitemapPath, 'utf8')

  // Check that it exports a default function
  if (!content.includes('export default')) {
    return {
      gate: 6,
      name: 'Sitemaps Work',
      passed: false,
      message: 'FAIL: app/sitemap.ts does not export default function',
    }
  }

  // Check that it uses lib/urls.ts
  if (!content.includes("from '@/lib/urls'") && !content.includes("from '../lib/urls'")) {
    return {
      gate: 6,
      name: 'Sitemaps Work',
      passed: false,
      message: 'FAIL: app/sitemap.ts does not import from lib/urls.ts',
    }
  }

  return {
    gate: 6,
    name: 'Sitemaps Work',
    passed: true,
    message: 'PASS: Sitemap file exists and imports from lib/urls.ts (run dev server to verify 200)',
  }
}

// =============================================================================
// Gate 4: Nearby Cities = 12 (data-testid verification)
// =============================================================================

async function gate4_nearbyCities(): Promise<GateResult> {
  const violations: string[] = []

  // Check NearbyCities component exists and has data-testid
  const nearbyCitiesPath = 'components/directory/NearbyCities.tsx'

  if (!fs.existsSync(nearbyCitiesPath)) {
    return {
      gate: 4,
      name: 'Nearby Cities',
      passed: false,
      message: 'FAIL: components/directory/NearbyCities.tsx does not exist',
    }
  }

  const content = fs.readFileSync(nearbyCitiesPath, 'utf8')

  // Check for data-testid="nearby-cities"
  if (!content.includes('data-testid="nearby-cities"')) {
    violations.push('NearbyCities.tsx: missing data-testid="nearby-cities"')
  }

  // Check for data-testid="nearby-city-link"
  if (!content.includes('data-testid="nearby-city-link"')) {
    violations.push('NearbyCities.tsx: missing data-testid="nearby-city-link"')
  }

  // Check that queries.ts has getNearbyCities with limit=12 default
  const queriesPath = 'lib/queries.ts'
  if (fs.existsSync(queriesPath)) {
    const queriesContent = fs.readFileSync(queriesPath, 'utf8')
    if (!queriesContent.includes('limit: number = 12')) {
      violations.push('lib/queries.ts: getNearbyCities should have limit=12 default')
    }
  }

  if (violations.length > 0) {
    return {
      gate: 4,
      name: 'Nearby Cities',
      passed: false,
      message: `FAIL: Nearby cities issues:\\n  ${violations.join('\\n  ')}`,
    }
  }

  return {
    gate: 4,
    name: 'Nearby Cities',
    passed: true,
    message: 'PASS: NearbyCities component has data-testid and limit=12 default',
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
// Gate 9: Tracked Outbound Actions (Slice 3)
// =============================================================================

async function gate9_trackedOutboundActions(): Promise<GateResult> {
  const violations: string[] = []

  const ctaFiles = [
    { file: 'components/cta/PhoneLink.tsx', testId: 'phone-cta' },
    { file: 'components/cta/DirectionsLink.tsx', testId: 'directions-cta' },
    { file: 'components/cta/WebsiteLink.tsx', testId: 'website-cta' },
  ]

  // Check each CTA component
  for (const { file, testId } of ctaFiles) {
    if (!fs.existsSync(file)) {
      violations.push(`${file} does not exist`)
      continue
    }

    const content = fs.readFileSync(file, 'utf8')

    // Must have data-testid
    if (!content.includes(`data-testid="${testId}"`)) {
      violations.push(`${file}: missing data-testid="${testId}"`)
    }

    // Must import trackOutboundEvent
    if (!content.includes('trackOutboundEvent')) {
      violations.push(`${file}: does not import/call trackOutboundEvent`)
    }

    // Must NOT have fetch()
    if (content.includes('fetch(')) {
      violations.push(`${file}: contains fetch() - violates adapter boundary`)
    }
  }

  // Check lib/trackers/outbound.ts exists
  if (!fs.existsSync('lib/trackers/outbound.ts')) {
    violations.push('lib/trackers/outbound.ts does not exist')
  } else {
    const trackerContent = fs.readFileSync('lib/trackers/outbound.ts', 'utf8')
    if (!trackerContent.includes('trackOutboundEvent')) {
      violations.push('lib/trackers/outbound.ts: missing trackOutboundEvent export')
    }
    // Must NOT have fetch()
    if (trackerContent.includes('fetch(')) {
      violations.push('lib/trackers/outbound.ts: contains fetch() - should be console sink only')
    }
  }

  // Check lib/events.ts exists
  if (!fs.existsSync('lib/events.ts')) {
    violations.push('lib/events.ts does not exist')
  } else {
    const eventsContent = fs.readFileSync('lib/events.ts', 'utf8')
    if (!eventsContent.includes('OutboundEvent')) {
      violations.push('lib/events.ts: missing OutboundEvent type')
    }
  }

  if (violations.length > 0) {
    return {
      gate: 9,
      name: 'Tracked Outbound Actions',
      passed: false,
      message: `FAIL: Tracked outbound action issues:\n  ${violations.join('\n  ')}`,
    }
  }

  return {
    gate: 9,
    name: 'Tracked Outbound Actions',
    passed: true,
    message: 'PASS: CTA components use trackOutboundEvent with no fetch()',
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
    case 2:
      return await gate2_noFormsOnDirectoryPages()
    case 3:
      return await gate3_canonicalsAndTrailingSlash()
    case 4:
      return await gate4_nearbyCities()
    case 5:
      return await gate5_routesOnlyInUrls()
    case 6:
      return await gate6_sitemapWorks()
    case 7:
      return await gate7_adapterBoundary()
    case 8:
      return await gate8_countsConsistent()
    case 9:
      return await gate9_trackedOutboundActions()
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

  // Run all Slice 0 + Slice 1 + Slice 2 + Slice 3 gates
  const allGates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const results: GateResult[] = []

  for (const gate of allGates) {
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
    console.log('❌ GATES FAILED - Fix issues before proceeding')
    process.exit(1)
  }

  console.log()
  console.log('✅ ALL GATES PASSED')
  process.exit(0)
}

main().catch((err) => {
  console.error('Gate verification failed:', err)
  process.exit(1)
})
