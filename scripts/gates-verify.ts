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
    '/admin/stores/', // Admin store management (Slice 10)
    '/api/stores/', // API routes for store data (not public pages)
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
  // Auth components legitimately need direct Supabase client for auth operations
  const allowedAuthPaths = [
    'components/auth/',
    'app/auth/',
  ]

  const files = await glob('{app,components,lib}/**/*.{ts,tsx}')
  const violations: string[] = []

  for (const file of files) {
    // Skip files in allowed paths
    if (allowedPaths.some((p) => file.includes(p))) {
      continue
    }

    // Skip auth components - they legitimately need createClient for auth.signIn/signOut/etc
    if (allowedAuthPaths.some((p) => file.includes(p))) {
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
    // Slice 10: fetch() now allowed for internal API persistence (/api/cta-event)
    // Verify it uses the internal API route, not external URLs
    if (trackerContent.includes('fetch(') && !trackerContent.includes('/api/cta-event')) {
      violations.push('lib/trackers/outbound.ts: contains fetch() to non-internal endpoint')
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
// Gate 10: Store Submission Isolation (Slice 4)
// =============================================================================

async function gate10_storeSubmissionIsolation(): Promise<GateResult> {
  const violations: string[] = []

  // 1. Check /stores/new/form.tsx exists and HAS a form
  const formPath = 'app/stores/new/form.tsx'
  if (!fs.existsSync(formPath)) {
    violations.push('app/stores/new/form.tsx does not exist')
  } else {
    const formContent = fs.readFileSync(formPath, 'utf8')
    if (!formContent.includes('<form')) {
      violations.push('app/stores/new/form.tsx: missing <form> element')
    }
    // Must use createStoreSubmission, NOT createStore or upsertStore
    // Check for function calls, not just substrings (createStoreSubmission contains createStore)
    if (/\bcreateStore\s*\(/.test(formContent) || /\bupsertStore\s*\(/.test(formContent)) {
      violations.push('app/stores/new/form.tsx: must NOT use createStore/upsertStore (use createStoreSubmission)')
    }
  }

  // 2. Check lib/queries.ts has createStoreSubmission (isolated)
  const queriesPath = 'lib/queries.ts'
  if (fs.existsSync(queriesPath)) {
    const queriesContent = fs.readFileSync(queriesPath, 'utf8')
    if (!queriesContent.includes('createStoreSubmission')) {
      violations.push('lib/queries.ts: missing createStoreSubmission function')
    }
    // createStoreSubmission must insert into store_submissions, NOT stores
    const createSubmissionMatch = queriesContent.match(/createStoreSubmission[\s\S]*?\.from\(['"`](\w+)['"`]\)/m)
    if (createSubmissionMatch && createSubmissionMatch[1] !== 'store_submissions') {
      violations.push(`lib/queries.ts: createStoreSubmission must insert into 'store_submissions', found '${createSubmissionMatch[1]}'`)
    }
  }

  // 3. Check lib/store-submission.ts exists for validation
  if (!fs.existsSync('lib/store-submission.ts')) {
    violations.push('lib/store-submission.ts does not exist')
  } else {
    const validationContent = fs.readFileSync('lib/store-submission.ts', 'utf8')
    if (!validationContent.includes('validateSubmission')) {
      violations.push('lib/store-submission.ts: missing validateSubmission function')
    }
  }

  // 4. Check types.ts has StoreSubmissionInsert
  const typesPath = 'lib/types.ts'
  if (fs.existsSync(typesPath)) {
    const typesContent = fs.readFileSync(typesPath, 'utf8')
    if (!typesContent.includes('StoreSubmissionInsert')) {
      violations.push('lib/types.ts: missing StoreSubmissionInsert type')
    }
    if (!typesContent.includes('StoreSubmissionRow')) {
      violations.push('lib/types.ts: missing StoreSubmissionRow type')
    }
  }

  // 5. Check migration exists
  const migrationFiles = await glob('supabase/migrations/*store_submissions*.sql')
  if (migrationFiles.length === 0) {
    violations.push('No store_submissions migration found in supabase/migrations/')
  }

  if (violations.length > 0) {
    return {
      gate: 10,
      name: 'Store Submission Isolation',
      passed: false,
      message: `FAIL: Store submission isolation issues:\n  ${violations.join('\n  ')}`,
    }
  }

  return {
    gate: 10,
    name: 'Store Submission Isolation',
    passed: true,
    message: 'PASS: Store submissions are isolated from directory (creates StoreSubmission, not Store)',
  }
}

// =============================================================================
// Gate 11: Deterministic Ordering (Slice 5)
// =============================================================================

async function gate11_deterministicOrdering(): Promise<GateResult> {
  const violations: string[] = []
  const queriesPath = 'lib/queries.ts'

  if (!fs.existsSync(queriesPath)) {
    return {
      gate: 11,
      name: 'Deterministic Ordering',
      passed: false,
      message: 'FAIL: lib/queries.ts does not exist',
    }
  }

  const content = fs.readFileSync(queriesPath, 'utf8')

  // Check getAllStates has ORDER BY name ASC
  if (content.includes('getAllStates')) {
    // Look for the function and its ordering
    const statesMatch = content.match(/getAllStates[\s\S]*?\.order\(['"`](\w+)['"`]/m)
    if (!statesMatch || statesMatch[1] !== 'name') {
      violations.push('getAllStates: must order by name (alphabetical)')
    }
  }

  // Check getCitiesByStateId has ORDER BY store_count DESC, name ASC
  if (content.includes('getCitiesByStateId')) {
    const citiesMatch = content.match(/getCitiesByStateId[\s\S]*?\.order\(['"`]store_count['"`][\s\S]*?\.order\(['"`]name['"`]/m)
    if (!citiesMatch) {
      violations.push('getCitiesByStateId: must order by store_count DESC, then name ASC')
    }
  }

  // Check getStoresByCityId has ORDER BY is_featured DESC, name ASC
  // Note: This function uses .sort() instead of .order() because it needs
  // runtime date comparison (featuredUntil > now) for effective featured status
  if (content.includes('getStoresByCityId')) {
    // Look for either .order() pattern OR .sort() with featured/name ordering
    const orderPattern = content.match(/getStoresByCityId[\s\S]*?\.order\(['"`]is_featured['"`][\s\S]*?\.order\(['"`]name['"`]/m)
    const sortPattern = content.match(/getStoresByCityId[\s\S]*?\.sort\([\s\S]*?Featured[\s\S]*?localeCompare/m)
    if (!orderPattern && !sortPattern) {
      violations.push('getStoresByCityId: must order by is_featured DESC, then name ASC')
    }
  }

  // Check getNearbyCities uses deterministic sorting
  if (content.includes('getNearbyCities')) {
    // Should have .sort() with localeCompare for name tiebreaker
    if (!content.includes('localeCompare')) {
      violations.push('getNearbyCities: must use localeCompare for deterministic name sorting')
    }
  }

  if (violations.length > 0) {
    return {
      gate: 11,
      name: 'Deterministic Ordering',
      passed: false,
      message: `FAIL: Ordering issues:\n  ${violations.join('\n  ')}`,
    }
  }

  return {
    gate: 11,
    name: 'Deterministic Ordering',
    passed: true,
    message: 'PASS: All queries use deterministic ordering (name ASC, store_count DESC, featured DESC)',
  }
}

// =============================================================================
// Gate 12: Import Discipline (Slice 5)
// =============================================================================

async function gate12_importDiscipline(): Promise<GateResult> {
  const violations: string[] = []

  // ADR-00X: Scraping is intentionally external
  // Verify no scraping adapters exist in the codebase
  const forbiddenFiles = [
    'lib/ingestion/apify.ts',
    'lib/ingestion/outscraper.ts',
    'scripts/import-apify.ts',
    'scripts/import-outscraper.ts',
  ]

  for (const file of forbiddenFiles) {
    if (fs.existsSync(file)) {
      violations.push(`${file}: scraping adapter should not exist (ADR-00X)`)
    }
  }

  // Verify ingestion boundary has the guard comment
  const boundaryPath = 'lib/ingestion/index.ts'
  if (fs.existsSync(boundaryPath)) {
    const content = fs.readFileSync(boundaryPath, 'utf8')
    if (!content.includes('SCRAPING IS INTENTIONALLY EXTERNAL')) {
      violations.push('lib/ingestion/index.ts: missing ADR-00X guard comment')
    }
  }

  if (violations.length > 0) {
    return {
      gate: 12,
      name: 'Import Discipline',
      passed: false,
      message: `FAIL: Import discipline issues:\n  ${violations.join('\n  ')}`,
    }
  }

  return {
    gate: 12,
    name: 'Import Discipline',
    passed: true,
    message: 'PASS: No scraping adapters, scraping is external (ADR-00X)',
  }
}

// =============================================================================
// Gate 13: Sitemap Completeness (Slice 5)
// =============================================================================

async function gate13_sitemapCompleteness(): Promise<GateResult> {
  const violations: string[] = []

  // Check sitemap.ts structure
  const sitemapPath = 'app/sitemap.ts'

  if (!fs.existsSync(sitemapPath)) {
    return {
      gate: 13,
      name: 'Sitemap Completeness',
      passed: false,
      message: 'FAIL: app/sitemap.ts does not exist',
    }
  }

  const content = fs.readFileSync(sitemapPath, 'utf8')

  // Must query states from DB
  if (!content.includes('getAllStates') && !content.includes('states')) {
    violations.push('sitemap.ts: must fetch states from database')
  }

  // Must query cities from DB (or iterate through states)
  if (!content.includes('getCitiesByStateId') && !content.includes('cities')) {
    violations.push('sitemap.ts: must fetch cities from database')
  }

  // Must use lib/urls.ts for URL generation
  if (!content.includes('getStateUrl') && !content.includes('getCityUrl')) {
    violations.push('sitemap.ts: must use getStateUrl/getCityUrl from lib/urls.ts')
  }

  // Must include homepage, all-states page
  if (!content.includes('getHomepageUrl') && !content.includes("url: '/'")) {
    violations.push('sitemap.ts: must include homepage URL')
  }

  // Must filter cities/states with store_count > 0 for indexing
  // (This is a soft check - the actual logic should be in shouldIndexCity/shouldIndexState)

  if (violations.length > 0) {
    return {
      gate: 13,
      name: 'Sitemap Completeness',
      passed: false,
      message: `FAIL: Sitemap completeness issues:\n  ${violations.join('\n  ')}`,
    }
  }

  return {
    gate: 13,
    name: 'Sitemap Completeness',
    passed: true,
    message: 'PASS: Sitemap fetches states/cities from DB and uses lib/urls.ts (run with DB for count verification)',
  }
}

// =============================================================================
// Gate 14: Trust Promotion Isolation (Slice 6)
// =============================================================================

async function gate14_trustPromotionIsolation(): Promise<GateResult> {
  const violations: string[] = []

  // 1. Public pages must not query store_submissions
  const publicPageFiles = await glob('app/**/page.tsx')
  const publicPages = publicPageFiles.filter((f: string) => !f.includes('/admin/'))

  for (const page of publicPages) {
    const content = fs.readFileSync(page, 'utf8')
    if (
      content.includes('store_submissions') ||
      content.includes("from 'store_submissions'") ||
      content.includes('getPendingSubmissions')
    ) {
      violations.push(`${page}: queries store_submissions (must be admin-only)`)
    }
  }

  // 2. lib/queries.ts approval functions must exist
  const queriesPath = 'lib/queries.ts'
  if (fs.existsSync(queriesPath)) {
    const queriesContent = fs.readFileSync(queriesPath, 'utf8')
    if (!queriesContent.includes('approveSubmission')) {
      violations.push('lib/queries.ts: missing approveSubmission function')
    }
    if (!queriesContent.includes('rejectSubmission')) {
      violations.push('lib/queries.ts: missing rejectSubmission function')
    }
  } else {
    violations.push('lib/queries.ts does not exist')
  }

  // 3. Sitemap must not reference store_submissions OR admin routes
  const sitemapPath = 'app/sitemap.ts'
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8')
    if (
      sitemapContent.includes('store_submissions') ||
      sitemapContent.includes('StoreSubmission')
    ) {
      violations.push('app/sitemap.ts: must not include store_submissions')
    }
    if (sitemapContent.includes('/admin')) {
      violations.push('app/sitemap.ts: must not include /admin routes')
    }
  }

  // 4. Admin routes must use force-dynamic (no static rendering)
  const adminPageFiles = await glob('app/admin/**/page.tsx')
  for (const page of adminPageFiles) {
    const content = fs.readFileSync(page, 'utf8')
    if (!content.includes("dynamic = 'force-dynamic'")) {
      violations.push(`${page}: must export dynamic = 'force-dynamic'`)
    }
  }

  // 5. No public links to admin routes (check non-admin pages)
  for (const page of publicPages) {
    const content = fs.readFileSync(page, 'utf8')
    // Check for href links to /admin
    if (content.includes('href="/admin') || content.includes("href='/admin")) {
      violations.push(`${page}: must not link to /admin routes`)
    }
  }

  if (violations.length > 0) {
    return {
      gate: 14,
      name: 'Trust Promotion Isolation',
      passed: false,
      message: `FAIL: Trust promotion isolation issues:\n  ${violations.join('\n  ')}`,
    }
  }

  return {
    gate: 14,
    name: 'Trust Promotion Isolation',
    passed: true,
    message: 'PASS: Trust promotion isolation intact (admin-only queries, no public links to admin)',
  }
}

// =============================================================================
// Gate 15: Marketing Surface Isolation
// =============================================================================

async function gate15_marketingSurfaceIsolation(): Promise<GateResult> {
  const violations: string[] = []

  const marketingPages = [
    'app/about/page.tsx',
    'app/contact/page.tsx',
    'app/advertise-with-us/page.tsx',
  ]

  for (const page of marketingPages) {
    if (!fs.existsSync(page)) continue

    const content = fs.readFileSync(page, 'utf8')

    // Must be server component (no 'use client')
    if (content.includes("'use client'") || content.includes('"use client"')) {
      violations.push(`${page}: must be server-only (no 'use client')`)
    }

    // No trust pipeline references
    if (
      content.includes('store_submissions') ||
      content.includes('approveSubmission') ||
      content.includes('rejectSubmission') ||
      content.includes('getPendingSubmissions')
    ) {
      violations.push(`${page}: references trust pipeline`)
    }

    // No mutation logic
    if (
      content.includes('.insert(') ||
      content.includes('.update(') ||
      content.includes('.delete(')
    ) {
      violations.push(`${page}: contains mutation logic`)
    }
  }

  // Sitemap must not include marketing pages
  const sitemapPath = 'app/sitemap.ts'
  if (fs.existsSync(sitemapPath)) {
    const sitemap = fs.readFileSync(sitemapPath, 'utf8')
    const marketingRoutes = ['/about', '/contact', '/advertise']
    for (const route of marketingRoutes) {
      if (sitemap.includes(`'${route}`) || sitemap.includes(`"${route}`)) {
        violations.push(`sitemap.ts: must not include ${route}`)
      }
    }
  }

  return violations.length === 0
    ? {
        gate: 15,
        name: 'Marketing Surface Isolation',
        passed: true,
        message: 'PASS: Marketing pages are read-only and sitemap-excluded',
      }
    : {
        gate: 15,
        name: 'Marketing Surface Isolation',
        passed: false,
        message: `FAIL: Marketing surface issues:\n  ${violations.join('\n  ')}`,
      }
}

// =============================================================================
// Gate 16: Ingestion Boundary (Trusted Data Entry)
// =============================================================================

async function gate16_ingestionBoundary(): Promise<GateResult> {
  const violations: string[] = []

  // Files allowed to insert into stores/cities tables
  const allowedFiles = [
    'lib/ingestion/submissions.ts',
    'lib/ingestion/index.ts',
    'scripts/gates-verify.ts', // Gate code itself contains pattern strings
    'scripts/import-canonical.ts', // Trusted admin import script for bulk data
  ]

  // Check all files in app/, components/, lib/, and scripts/
  const files = await glob('{app,components,lib,scripts}/**/*.{ts,tsx}')

  for (const file of files) {
    // Skip allowed files
    if (allowedFiles.some((allowed) => file.endsWith(allowed))) {
      continue
    }

    const content = fs.readFileSync(file, 'utf8')
    const lines = content.split('\n')

    // Check each line for store/city inserts
    // This avoids false positives from multi-line regex matching unrelated code
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Look for .from('stores').insert or .from('stores').upsert patterns
      // Could span 2-3 lines, so check a small window
      const window = lines.slice(i, Math.min(i + 5, lines.length)).join('\n')

      // Store inserts - must have .from('stores') followed by .insert/.upsert within close proximity
      if (window.includes(".from('stores')") || window.includes('.from("stores")')) {
        if (window.includes('.insert(') || window.includes('.upsert(')) {
          // Verify it's actually a stores insert/upsert, not just nearby code
          const storesIndex = Math.max(
            window.indexOf(".from('stores')"),
            window.indexOf('.from("stores")')
          )
          const insertIndex = window.indexOf('.insert(')
          const upsertIndex = window.indexOf('.upsert(')

          // Check if insert/upsert comes after .from('stores') in the window
          if (
            (insertIndex > storesIndex && insertIndex - storesIndex < 100) ||
            (upsertIndex > storesIndex && upsertIndex - storesIndex < 100)
          ) {
            violations.push(`${file}:${i + 1}: direct store insert/upsert outside ingestion boundary`)
            break
          }
        }
      }

      // City inserts - must have .from('cities') followed by .insert/.upsert within close proximity
      if (window.includes(".from('cities')") || window.includes('.from("cities")')) {
        if (window.includes('.insert(') || window.includes('.upsert(')) {
          const citiesIndex = Math.max(
            window.indexOf(".from('cities')"),
            window.indexOf('.from("cities")')
          )
          const insertIndex = window.indexOf('.insert(')
          const upsertIndex = window.indexOf('.upsert(')

          if (
            (insertIndex > citiesIndex && insertIndex - citiesIndex < 100) ||
            (upsertIndex > citiesIndex && upsertIndex - citiesIndex < 100)
          ) {
            violations.push(`${file}:${i + 1}: direct city insert/upsert outside ingestion boundary`)
            break
          }
        }
      }
    }
  }

  // Verify ingestion boundary files exist
  const boundaryFiles = [
    'lib/ingestion/index.ts',
    'lib/ingestion/submissions.ts',
  ]

  for (const boundaryFile of boundaryFiles) {
    if (!fs.existsSync(boundaryFile)) {
      violations.push(`${boundaryFile} does not exist`)
    }
  }

  // Verify ingestion boundary exports required functions
  if (fs.existsSync('lib/ingestion/index.ts')) {
    const indexContent = fs.readFileSync('lib/ingestion/index.ts', 'utf8')
    if (!indexContent.includes('ingestStoreFromSubmission')) {
      violations.push('lib/ingestion/index.ts: missing ingestStoreFromSubmission export')
    }
    if (!indexContent.includes('logIngestion')) {
      violations.push('lib/ingestion/index.ts: missing logIngestion export')
    }
  }

  if (violations.length > 0) {
    return {
      gate: 16,
      name: 'Ingestion Boundary',
      passed: false,
      message: `FAIL: Ingestion boundary issues:\n  ${violations.join('\n  ')}`,
    }
  }

  return {
    gate: 16,
    name: 'Ingestion Boundary',
    passed: true,
    message: 'PASS: All store/city inserts go through lib/ingestion/',
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
    case 10:
      return await gate10_storeSubmissionIsolation()
    case 11:
      return await gate11_deterministicOrdering()
    case 12:
      return await gate12_importDiscipline()
    case 13:
      return await gate13_sitemapCompleteness()
    case 14:
      return await gate14_trustPromotionIsolation()
    case 15:
      return await gate15_marketingSurfaceIsolation()
    case 16:
      return await gate16_ingestionBoundary()
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

  // Run all Core Gates (0-10) + Scale Gates (11-13) + Trust Gates (14) + Surface Gates (15) + Ingestion Gate (16)
  const allGates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
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
