#!/usr/bin/env npx tsx
/**
 * SEO Surface Verification Script
 *
 * Slice 11: Hardening Guardrails
 *
 * Verifies SEO surface is identical across environments.
 * Supports configurable BASE_URL and local vs prod comparison mode.
 *
 * Usage:
 *   SEO_VERIFY_BASE_URL=http://localhost:3000 npx tsx scripts/seo-verify.ts
 *   SEO_VERIFY_BASE_URL=https://scratchanddentfinder.com npx tsx scripts/seo-verify.ts
 *   npx tsx scripts/seo-verify.ts --compare local,prod
 */

import * as cheerio from 'cheerio'

// =============================================================================
// Types
// =============================================================================

interface SEOSnapshot {
  url: string
  canonical: string | null
  robotsMeta: string | null
  title: string | null
  description: string | null
  ogTitle: string | null
  ogDescription: string | null
}

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

interface VerificationResult {
  page: string
  passed: boolean
  issues: string[]
}

// =============================================================================
// Configuration
// =============================================================================

const LOCAL_BASE_URL = 'http://localhost:3000'
const PROD_BASE_URL = process.env.PROD_BASE_URL || 'https://scratchanddentfinder.com'

// Test pages for SEO verification (minimum coverage)
const TEST_PAGES = [
  '/',                                                    // Homepage
  '/scratch-and-dent-appliances/',                       // All states
  '/scratch-and-dent-appliances/california/',            // State page
  '/scratch-and-dent-appliances/california/los-angeles/', // City page
  '/about/',                                              // Static page
  '/contact/',                                            // Static page
  '/advertise-with-us/',                                  // Marketing page
]

// =============================================================================
// HTML Parsing
// =============================================================================

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SEO-Verify-Bot/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  return response.text()
}

function extractSEOData(html: string, pageUrl: string): SEOSnapshot {
  const $ = cheerio.load(html)

  return {
    url: pageUrl,
    canonical: $('link[rel="canonical"]').attr('href') || null,
    robotsMeta: $('meta[name="robots"]').attr('content') || null,
    title: $('title').text() || null,
    description: $('meta[name="description"]').attr('content') || null,
    ogTitle: $('meta[property="og:title"]').attr('content') || null,
    ogDescription: $('meta[property="og:description"]').attr('content') || null,
  }
}

// =============================================================================
// Sitemap Validation
// =============================================================================

async function fetchSitemap(baseUrl: string): Promise<SitemapEntry[]> {
  const sitemapUrl = `${baseUrl}/sitemap.xml`
  const response = await fetch(sitemapUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`)
  }

  const xml = await response.text()
  const $ = cheerio.load(xml, { xmlMode: true })
  const entries: SitemapEntry[] = []

  $('url').each((_, el) => {
    entries.push({
      loc: $(el).find('loc').text(),
      lastmod: $(el).find('lastmod').text() || undefined,
      changefreq: $(el).find('changefreq').text() || undefined,
      priority: $(el).find('priority').text() || undefined,
    })
  })

  return entries
}

function validateSitemapEntry(entry: SitemapEntry): string[] {
  const issues: string[] = []

  // Must be absolute URL
  if (!entry.loc.startsWith('http://') && !entry.loc.startsWith('https://')) {
    issues.push(`URL is not absolute: ${entry.loc}`)
  }

  // Must end with trailing slash
  if (!entry.loc.endsWith('/')) {
    issues.push(`URL missing trailing slash: ${entry.loc}`)
  }

  // Must not be admin or API route
  if (entry.loc.includes('/admin/') || entry.loc.includes('/api/')) {
    issues.push(`Non-public URL in sitemap: ${entry.loc}`)
  }

  return issues
}

// =============================================================================
// Robots.txt Validation
// =============================================================================

async function fetchRobots(baseUrl: string): Promise<string> {
  const robotsUrl = `${baseUrl}/robots.txt`
  const response = await fetch(robotsUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch robots.txt: ${response.status}`)
  }

  return response.text()
}

function validateRobots(content: string, expectedSitemapUrl: string): string[] {
  const issues: string[] = []
  const lines = content.split('\n').map(l => l.trim().toLowerCase())

  // Check for disallow /admin/
  const hasAdminDisallow = lines.some(l =>
    l.includes('disallow') && (l.includes('/admin') || l.includes('/dashboard'))
  )
  if (!hasAdminDisallow) {
    issues.push('robots.txt should disallow /admin/ or /dashboard/')
  }

  // Check for disallow /api/
  const hasApiDisallow = lines.some(l =>
    l.includes('disallow') && l.includes('/api')
  )
  if (!hasApiDisallow) {
    issues.push('robots.txt should disallow /api/')
  }

  // Check for sitemap directive
  const hasSitemap = content.toLowerCase().includes('sitemap:')
  if (!hasSitemap) {
    issues.push('robots.txt missing Sitemap directive')
  }

  return issues
}

// =============================================================================
// Page Verification
// =============================================================================

function verifyPageSEO(snapshot: SEOSnapshot, baseUrl: string): VerificationResult {
  const issues: string[] = []

  // Must have canonical
  if (!snapshot.canonical) {
    issues.push('Missing canonical URL')
  } else {
    // Canonical must be absolute
    if (!snapshot.canonical.startsWith('http')) {
      issues.push(`Canonical is not absolute: ${snapshot.canonical}`)
    }
    // Canonical must end with /
    if (!snapshot.canonical.endsWith('/')) {
      issues.push(`Canonical missing trailing slash: ${snapshot.canonical}`)
    }
  }

  // Must have title
  if (!snapshot.title) {
    issues.push('Missing title tag')
  }

  // Must have description
  if (!snapshot.description) {
    issues.push('Missing meta description')
  } else if (snapshot.description.length < 50) {
    issues.push(`Meta description too short: ${snapshot.description.length} chars`)
  } else if (snapshot.description.length > 160) {
    issues.push(`Meta description too long: ${snapshot.description.length} chars`)
  }

  return {
    page: snapshot.url,
    passed: issues.length === 0,
    issues,
  }
}

// =============================================================================
// Comparison Mode
// =============================================================================

function compareSEOSnapshots(local: SEOSnapshot, prod: SEOSnapshot): string[] {
  const diffs: string[] = []

  // Compare titles (normalize whitespace)
  const localTitle = local.title?.replace(/\s+/g, ' ').trim()
  const prodTitle = prod.title?.replace(/\s+/g, ' ').trim()
  if (localTitle !== prodTitle) {
    diffs.push(`Title mismatch:\n  Local: ${localTitle}\n  Prod:  ${prodTitle}`)
  }

  // Compare descriptions (normalize whitespace)
  const localDesc = local.description?.replace(/\s+/g, ' ').trim()
  const prodDesc = prod.description?.replace(/\s+/g, ' ').trim()
  if (localDesc !== prodDesc) {
    diffs.push(`Description mismatch:\n  Local: ${localDesc}\n  Prod:  ${prodDesc}`)
  }

  // Compare canonical paths (ignore domain)
  const localCanonicalPath = local.canonical?.replace(/^https?:\/\/[^/]+/, '')
  const prodCanonicalPath = prod.canonical?.replace(/^https?:\/\/[^/]+/, '')
  if (localCanonicalPath !== prodCanonicalPath) {
    diffs.push(`Canonical path mismatch:\n  Local: ${localCanonicalPath}\n  Prod:  ${prodCanonicalPath}`)
  }

  // Compare robots meta
  if (local.robotsMeta !== prod.robotsMeta) {
    diffs.push(`Robots meta mismatch:\n  Local: ${local.robotsMeta}\n  Prod:  ${prod.robotsMeta}`)
  }

  return diffs
}

// =============================================================================
// Main Execution
// =============================================================================

async function runSingleEnvironment(baseUrl: string): Promise<boolean> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`  SEO VERIFICATION: ${baseUrl}`)
  console.log(`${'='.repeat(60)}\n`)

  let allPassed = true

  // Verify pages
  console.log('Verifying pages...\n')
  for (const page of TEST_PAGES) {
    const url = `${baseUrl}${page}`
    try {
      const html = await fetchPage(url)
      const snapshot = extractSEOData(html, url)
      const result = verifyPageSEO(snapshot, baseUrl)

      if (result.passed) {
        console.log(`  ✅ ${page}`)
      } else {
        console.log(`  ❌ ${page}`)
        result.issues.forEach(issue => console.log(`     - ${issue}`))
        allPassed = false
      }
    } catch (error) {
      console.log(`  ❌ ${page}`)
      console.log(`     - Failed to fetch: ${error}`)
      allPassed = false
    }
  }

  // Verify sitemap
  console.log('\nVerifying sitemap...\n')
  try {
    const entries = await fetchSitemap(baseUrl)
    console.log(`  Found ${entries.length} URLs in sitemap`)

    let sitemapIssues = 0
    for (const entry of entries) {
      const issues = validateSitemapEntry(entry)
      if (issues.length > 0) {
        issues.forEach(issue => console.log(`  ❌ ${issue}`))
        sitemapIssues++
        allPassed = false
      }
    }

    if (sitemapIssues === 0) {
      console.log('  ✅ All sitemap URLs valid')
    }
  } catch (error) {
    console.log(`  ❌ Failed to fetch sitemap: ${error}`)
    allPassed = false
  }

  // Verify robots.txt
  console.log('\nVerifying robots.txt...\n')
  try {
    const robots = await fetchRobots(baseUrl)
    const robotsIssues = validateRobots(robots, `${baseUrl}/sitemap.xml`)

    if (robotsIssues.length === 0) {
      console.log('  ✅ robots.txt valid')
    } else {
      robotsIssues.forEach(issue => console.log(`  ❌ ${issue}`))
      allPassed = false
    }
  } catch (error) {
    console.log(`  ❌ Failed to fetch robots.txt: ${error}`)
    allPassed = false
  }

  return allPassed
}

async function runComparison(): Promise<boolean> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`  SEO COMPARISON: Local vs Prod`)
  console.log(`${'='.repeat(60)}\n`)
  console.log(`  Local: ${LOCAL_BASE_URL}`)
  console.log(`  Prod:  ${PROD_BASE_URL}\n`)

  let allPassed = true

  for (const page of TEST_PAGES) {
    const localUrl = `${LOCAL_BASE_URL}${page}`
    const prodUrl = `${PROD_BASE_URL}${page}`

    try {
      const [localHtml, prodHtml] = await Promise.all([
        fetchPage(localUrl),
        fetchPage(prodUrl),
      ])

      const localSnapshot = extractSEOData(localHtml, localUrl)
      const prodSnapshot = extractSEOData(prodHtml, prodUrl)
      const diffs = compareSEOSnapshots(localSnapshot, prodSnapshot)

      if (diffs.length === 0) {
        console.log(`  ✅ ${page} - identical`)
      } else {
        console.log(`  ❌ ${page} - DRIFT DETECTED`)
        diffs.forEach(diff => console.log(`     ${diff}`))
        allPassed = false
      }
    } catch (error) {
      console.log(`  ❌ ${page} - Failed to compare: ${error}`)
      allPassed = false
    }
  }

  return allPassed
}

async function main() {
  const args = process.argv.slice(2)
  const isCompareMode = args.includes('--compare')

  let passed: boolean

  if (isCompareMode) {
    passed = await runComparison()
  } else {
    const baseUrl = process.env.SEO_VERIFY_BASE_URL || LOCAL_BASE_URL
    passed = await runSingleEnvironment(baseUrl)
  }

  console.log(`\n${'='.repeat(60)}`)
  if (passed) {
    console.log('  ✅ SEO VERIFICATION PASSED')
  } else {
    console.log('  ❌ SEO VERIFICATION FAILED')
  }
  console.log(`${'='.repeat(60)}\n`)

  process.exit(passed ? 0 : 1)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
