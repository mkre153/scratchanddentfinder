#!/usr/bin/env npx tsx
/**
 * Routes Inventory Script
 *
 * Slice 11: Hardening Guardrails
 *
 * Enumerates all routes from Next.js build output and classifies them.
 * Uses pattern matching (regex) for dynamic routes.
 * Flags any unexpected public routes.
 *
 * Usage:
 *   npx tsx scripts/routes-inventory.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// =============================================================================
// Route Classification
// =============================================================================

/**
 * Public route patterns - these are allowed in the SEO surface (sitemap-eligible)
 * Uses regex to pattern-match dynamic segments
 */
const PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  /^\/$/,                                              // Homepage
  /^\/scratch-and-dent-appliances\/$/,                // All states
  /^\/scratch-and-dent-appliances\/[a-z-]+\/$/,       // State pages (dynamic)
  /^\/scratch-and-dent-appliances\/[a-z-]+\/[a-z-]+\/$/, // City pages (dynamic)
  /^\/about\/$/,                                       // About
  /^\/contact\/$/,                                     // Contact
  /^\/advertise-with-us\/$/,                          // Advertise
  /^\/stores\/new\/$/,                                // Store submission form
]

/**
 * Non-public route patterns - explicitly excluded from SEO surface checks
 * These are allowed to exist but MUST NOT appear in sitemap
 */
const NON_PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  /^\/admin(\/.*)?$/,    // Admin routes - never public
  /^\/api(\/.*)?$/,      // API routes - never public
  /^\/dashboard(\/.*)?$/, // Dashboard routes - never public
]

/**
 * Special routes that are infrastructure, not content
 */
const INFRASTRUCTURE_PATTERNS: RegExp[] = [
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/_not-found\/$/,
  /^\/_error$/,
]

type RouteClassification = 'public' | 'non-public' | 'infrastructure' | 'unexpected'

/**
 * Classify a route based on patterns
 */
export function classifyRoute(route: string): RouteClassification {
  // Ensure trailing slash for consistent matching (except special files)
  const normalizedRoute = route.endsWith('/') || route.includes('.') ? route : `${route}/`

  // Check infrastructure first
  if (INFRASTRUCTURE_PATTERNS.some(p => p.test(normalizedRoute))) {
    return 'infrastructure'
  }

  // Check non-public routes (admin, API)
  if (NON_PUBLIC_ROUTE_PATTERNS.some(p => p.test(normalizedRoute))) {
    return 'non-public'
  }

  // Check public routes
  if (PUBLIC_ROUTE_PATTERNS.some(p => p.test(normalizedRoute))) {
    return 'public'
  }

  // If none match, it's unexpected
  return 'unexpected'
}

/**
 * Check if a route is allowed as a public route
 * This is the key helper for surface verification
 */
export function isAllowedPublicRoute(route: string): boolean {
  const classification = classifyRoute(route)
  return classification === 'public'
}

/**
 * Check if a route is explicitly non-public (admin, API)
 */
export function isNonPublicRoute(route: string): boolean {
  const classification = classifyRoute(route)
  return classification === 'non-public'
}

// =============================================================================
// Build Output Parsing
// =============================================================================

interface DiscoveredRoute {
  path: string
  isDynamic: boolean
  type: 'page' | 'route' | 'special'
}

/**
 * Parse the Next.js build output directory to discover routes
 */
function discoverRoutes(buildDir: string): DiscoveredRoute[] {
  const routes: DiscoveredRoute[] = []
  const appDir = path.join(buildDir, '.next', 'server', 'app')

  if (!fs.existsSync(appDir)) {
    throw new Error(`Build output not found at ${appDir}. Run 'npm run build' first.`)
  }

  function walkDir(dir: string, prefix: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Handle dynamic route segments
        let segment = entry.name
        let isDynamic = false

        if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
          // Dynamic segment like [state] or [city]
          segment = '[dynamic]'
          isDynamic = true
        }

        walkDir(fullPath, `${prefix}/${segment}`)
      } else if (entry.isFile()) {
        // Look for page indicators
        if (entry.name === 'page.js' || entry.name === 'page.html') {
          const routePath = prefix || '/'
          routes.push({
            path: routePath.replace(/\/\[dynamic\]/g, '/[param]'),
            isDynamic: prefix.includes('[dynamic]'),
            type: 'page',
          })
        } else if (entry.name === 'route.js') {
          routes.push({
            path: prefix || '/',
            isDynamic: prefix.includes('[dynamic]'),
            type: 'route',
          })
        } else if (entry.name.endsWith('.xml') || entry.name.endsWith('.txt')) {
          // Special files like sitemap.xml, robots.txt
          routes.push({
            path: `${prefix}/${entry.name.replace(/\.(body|meta)$/, '')}`,
            isDynamic: false,
            type: 'special',
          })
        }
      }
    }
  }

  walkDir(appDir)

  // Deduplicate and normalize
  const seen = new Set<string>()
  return routes.filter(r => {
    const key = `${r.path}:${r.type}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Convert discovered route to a concrete example path for verification
 */
function routeToExamplePath(route: DiscoveredRoute): string {
  let path = route.path

  // Replace dynamic segments with example values for pattern matching
  if (path.includes('[param]')) {
    // State page example
    if (path === '/scratch-and-dent-appliances/[param]') {
      return '/scratch-and-dent-appliances/california/'
    }
    // City page example
    if (path === '/scratch-and-dent-appliances/[param]/[param]') {
      return '/scratch-and-dent-appliances/california/los-angeles/'
    }
  }

  // Add trailing slash if not a special file
  if (!path.includes('.') && !path.endsWith('/')) {
    path = `${path}/`
  }

  return path
}

// =============================================================================
// Main Execution
// =============================================================================

interface RouteReport {
  public: DiscoveredRoute[]
  nonPublic: DiscoveredRoute[]
  infrastructure: DiscoveredRoute[]
  unexpected: DiscoveredRoute[]
}

function generateReport(routes: DiscoveredRoute[]): RouteReport {
  const report: RouteReport = {
    public: [],
    nonPublic: [],
    infrastructure: [],
    unexpected: [],
  }

  for (const route of routes) {
    const examplePath = routeToExamplePath(route)
    const classification = classifyRoute(examplePath)

    switch (classification) {
      case 'public':
        report.public.push(route)
        break
      case 'non-public':
        report.nonPublic.push(route)
        break
      case 'infrastructure':
        report.infrastructure.push(route)
        break
      case 'unexpected':
        report.unexpected.push(route)
        break
    }
  }

  return report
}

async function main() {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`  ROUTES INVENTORY`)
  console.log(`${'='.repeat(60)}\n`)

  const buildDir = process.cwd()

  // Discover routes from build output
  let routes: DiscoveredRoute[]
  try {
    routes = discoverRoutes(buildDir)
    console.log(`Found ${routes.length} routes in build output\n`)
  } catch (error) {
    console.error(`❌ ${error}`)
    process.exit(1)
  }

  // Generate classification report
  const report = generateReport(routes)

  // Print public routes (expected)
  console.log(`PUBLIC ROUTES (${report.public.length}):`)
  report.public.forEach(r => {
    console.log(`  ✅ ${r.path}${r.isDynamic ? ' [dynamic]' : ''}`)
  })

  // Print non-public routes (expected)
  console.log(`\nNON-PUBLIC ROUTES (${report.nonPublic.length}):`)
  report.nonPublic.forEach(r => {
    console.log(`  🔒 ${r.path}${r.isDynamic ? ' [dynamic]' : ''}`)
  })

  // Print infrastructure routes (expected)
  console.log(`\nINFRASTRUCTURE (${report.infrastructure.length}):`)
  report.infrastructure.forEach(r => {
    console.log(`  ⚙️  ${r.path}`)
  })

  // Print unexpected routes (FAIL)
  console.log(`\nUNEXPECTED ROUTES (${report.unexpected.length}):`)
  if (report.unexpected.length > 0) {
    report.unexpected.forEach(r => {
      console.log(`  ❌ ${r.path}${r.isDynamic ? ' [dynamic]' : ''} - NOT IN WHITELIST`)
    })
  } else {
    console.log('  None')
  }

  // Final verdict
  console.log(`\n${'='.repeat(60)}`)
  if (report.unexpected.length === 0) {
    console.log('  ✅ ROUTES INVENTORY PASSED')
    console.log('  All routes are properly classified.')
  } else {
    console.log('  ❌ ROUTES INVENTORY FAILED')
    console.log(`  ${report.unexpected.length} unexpected public route(s) detected.`)
    console.log('  Add to PUBLIC_ROUTE_PATTERNS or NON_PUBLIC_ROUTE_PATTERNS.')
  }
  console.log(`${'='.repeat(60)}\n`)

  process.exit(report.unexpected.length === 0 ? 0 : 1)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
