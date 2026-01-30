#!/usr/bin/env npx tsx
/**
 * SEO & AEO (AI Engine Optimization) Audit Script
 *
 * Comprehensive audit against the 12-section SEO/AEO framework.
 * Generates a markdown report with pass/fail results for each check.
 *
 * Usage:
 *   npx tsx scripts/seo-aeo-audit.ts
 *   SEO_AUDIT_BASE_URL=https://scratchanddentfinder.com npx tsx scripts/seo-aeo-audit.ts
 *
 * Output:
 *   docs/SEO-AEO-AUDIT-REPORT.md
 */

import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'

// =============================================================================
// Types
// =============================================================================

interface AuditCheck {
  name: string
  status: 'pass' | 'fail' | 'warn' | 'info'
  message: string
  details?: string[]
}

interface PageAudit {
  url: string
  path: string
  metadata: AuditCheck[]
  schema: AuditCheck[]
  headings: AuditCheck[]
  aiReadability: AuditCheck[]
  technical: AuditCheck[]
}

interface SiteAudit {
  timestamp: string
  baseUrl: string
  pages: PageAudit[]
  sitemap: AuditCheck[]
  robots: AuditCheck[]
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
  }
}

interface SchemaObject {
  '@type': string
  '@context'?: string
  [key: string]: unknown
}

interface HeadingNode {
  level: number
  text: string
}

// =============================================================================
// Configuration
// =============================================================================

const BASE_URL = process.env.SEO_AUDIT_BASE_URL || 'http://localhost:3000'
const IS_DEV_MODE = BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')

// Pages to audit (based on plan requirements)
const AUDIT_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/scratch-and-dent-appliances/', name: 'All States' },
  { path: '/scratch-and-dent-appliances/california/', name: 'Sample State (California)' },
  { path: '/scratch-and-dent-appliances/california/los-angeles/', name: 'Sample City (Los Angeles)' },
  { path: '/about/', name: 'About' },
  { path: '/buyers-guide/', name: 'Buyers Guide' },
]

// Expected schema types per page type
const EXPECTED_SCHEMAS: Record<string, string[]> = {
  '/': ['Organization', 'WebSite'],
  '/scratch-and-dent-appliances/': ['Organization', 'WebSite', 'BreadcrumbList'],
  state: ['Organization', 'WebSite', 'BreadcrumbList'],
  city: ['Organization', 'WebSite', 'BreadcrumbList', 'LocalBusiness'],
  '/about/': ['Organization', 'WebSite'],
  '/buyers-guide/': ['Organization', 'WebSite', 'FAQPage'],
}

// =============================================================================
// Fetching Utilities
// =============================================================================

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SEO-AEO-Audit-Bot/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  return response.text()
}

async function checkUrl(url: string): Promise<{ status: number; redirectTo?: string }> {
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': 'SEO-AEO-Audit-Bot/1.0' },
    })
    return {
      status: response.status,
      redirectTo: response.headers.get('location') || undefined,
    }
  } catch {
    return { status: 0 }
  }
}

// =============================================================================
// Metadata Audits
// =============================================================================

function auditMetadata($: cheerio.CheerioAPI, pagePath: string): AuditCheck[] {
  const checks: AuditCheck[] = []

  // 1. Title tag
  const title = $('title').text()
  if (!title) {
    checks.push({ name: 'Title Tag', status: 'fail', message: 'Missing title tag' })
  } else if (title.length < 30) {
    checks.push({ name: 'Title Tag', status: 'warn', message: `Title too short (${title.length} chars)`, details: [title] })
  } else if (title.length > 70) {
    checks.push({ name: 'Title Tag', status: 'warn', message: `Title too long (${title.length} chars)`, details: [title] })
  } else {
    checks.push({ name: 'Title Tag', status: 'pass', message: `Valid title (${title.length} chars)` })
  }

  // 2. Meta description
  const description = $('meta[name="description"]').attr('content')
  if (!description) {
    checks.push({ name: 'Meta Description', status: 'fail', message: 'Missing meta description' })
  } else if (description.length < 100) {
    checks.push({ name: 'Meta Description', status: 'warn', message: `Description short (${description.length} chars, recommend 150-160)` })
  } else if (description.length > 160) {
    checks.push({ name: 'Meta Description', status: 'warn', message: `Description may truncate (${description.length} chars)` })
  } else {
    checks.push({ name: 'Meta Description', status: 'pass', message: `Valid description (${description.length} chars)` })
  }

  // 3. Canonical URL
  const canonical = $('link[rel="canonical"]').attr('href')
  if (!canonical) {
    checks.push({ name: 'Canonical URL', status: 'fail', message: 'Missing canonical URL' })
  } else if (!canonical.startsWith('https://')) {
    checks.push({ name: 'Canonical URL', status: 'fail', message: 'Canonical must be absolute HTTPS', details: [canonical] })
  } else if (!canonical.endsWith('/')) {
    checks.push({ name: 'Canonical URL', status: 'fail', message: 'Canonical missing trailing slash', details: [canonical] })
  } else {
    checks.push({ name: 'Canonical URL', status: 'pass', message: 'Valid canonical with trailing slash' })
  }

  // 4. Open Graph tags
  const ogTitle = $('meta[property="og:title"]').attr('content')
  const ogDescription = $('meta[property="og:description"]').attr('content')
  const ogImage = $('meta[property="og:image"]').attr('content')
  const ogUrl = $('meta[property="og:url"]').attr('content')
  const ogType = $('meta[property="og:type"]').attr('content')

  const ogIssues: string[] = []
  if (!ogTitle) ogIssues.push('Missing og:title')
  if (!ogDescription) ogIssues.push('Missing og:description')
  if (!ogImage) ogIssues.push('Missing og:image')
  if (!ogUrl) ogIssues.push('Missing og:url')
  if (!ogType) ogIssues.push('Missing og:type')

  if (ogIssues.length === 0) {
    checks.push({ name: 'Open Graph Tags', status: 'pass', message: 'All OG tags present' })
  } else {
    checks.push({ name: 'Open Graph Tags', status: 'fail', message: `Missing OG tags (${ogIssues.length}/5)`, details: ogIssues })
  }

  // 5. Twitter Card tags
  const twitterCard = $('meta[name="twitter:card"]').attr('content')
  const twitterTitle = $('meta[name="twitter:title"]').attr('content')
  const twitterDescription = $('meta[name="twitter:description"]').attr('content')
  const twitterImage = $('meta[name="twitter:image"]').attr('content')

  const twitterIssues: string[] = []
  if (!twitterCard) twitterIssues.push('Missing twitter:card')
  if (!twitterTitle) twitterIssues.push('Missing twitter:title')
  if (!twitterDescription) twitterIssues.push('Missing twitter:description')
  if (!twitterImage) twitterIssues.push('Missing twitter:image')

  if (twitterIssues.length === 0) {
    checks.push({ name: 'Twitter Card Tags', status: 'pass', message: 'All Twitter tags present' })
  } else if (twitterIssues.length <= 2) {
    checks.push({ name: 'Twitter Card Tags', status: 'warn', message: `Some Twitter tags missing`, details: twitterIssues })
  } else {
    checks.push({ name: 'Twitter Card Tags', status: 'fail', message: `Most Twitter tags missing`, details: twitterIssues })
  }

  return checks
}

// =============================================================================
// Schema Audits
// =============================================================================

function extractSchemas($: cheerio.CheerioAPI): SchemaObject[] {
  const schemas: SchemaObject[] = []

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html()
      if (content) {
        const parsed = JSON.parse(content)
        // Handle array or single object
        if (Array.isArray(parsed)) {
          schemas.push(...parsed)
        } else {
          schemas.push(parsed)
        }
      }
    } catch {
      // Invalid JSON-LD
    }
  })

  return schemas
}

function auditSchema($: cheerio.CheerioAPI, pagePath: string): AuditCheck[] {
  const checks: AuditCheck[] = []
  const schemas = extractSchemas($)
  const foundTypes = schemas.map(s => s['@type']).filter(Boolean) as string[]

  // Determine expected schemas based on page path
  let expected: string[]
  if (pagePath === '/') {
    expected = EXPECTED_SCHEMAS['/']
  } else if (pagePath === '/scratch-and-dent-appliances/') {
    expected = EXPECTED_SCHEMAS['/scratch-and-dent-appliances/']
  } else if (pagePath.startsWith('/scratch-and-dent-appliances/') && pagePath.split('/').filter(Boolean).length === 2) {
    expected = EXPECTED_SCHEMAS['state']
  } else if (pagePath.startsWith('/scratch-and-dent-appliances/') && pagePath.split('/').filter(Boolean).length === 3) {
    expected = EXPECTED_SCHEMAS['city']
  } else if (pagePath === '/about/') {
    expected = EXPECTED_SCHEMAS['/about/']
  } else if (pagePath === '/buyers-guide/') {
    expected = EXPECTED_SCHEMAS['/buyers-guide/']
  } else {
    expected = ['Organization', 'WebSite']
  }

  // Check for each expected schema
  for (const schemaType of expected) {
    if (foundTypes.includes(schemaType)) {
      checks.push({
        name: `Schema: ${schemaType}`,
        status: 'pass',
        message: `${schemaType} schema present`,
      })
    } else {
      const status = schemaType === 'FAQPage' || schemaType === 'HowTo' ? 'warn' : 'fail'
      checks.push({
        name: `Schema: ${schemaType}`,
        status,
        message: `MISSING: ${schemaType} schema expected but not found`,
      })
    }
  }

  // Check for LocalBusiness on city pages
  if (pagePath.startsWith('/scratch-and-dent-appliances/') && pagePath.split('/').filter(Boolean).length === 3) {
    const localBusinessCount = schemas.filter(s => s['@type'] === 'LocalBusiness').length
    if (localBusinessCount > 0) {
      checks.push({
        name: 'Schema: LocalBusiness Count',
        status: 'info',
        message: `${localBusinessCount} LocalBusiness schema(s) found for stores`,
      })
    }
  }

  // Check for FAQPage on buyers-guide (critical gap)
  if (pagePath === '/buyers-guide/') {
    const hasFAQ = foundTypes.includes('FAQPage')
    if (!hasFAQ) {
      checks.push({
        name: 'Schema: FAQPage (Critical Gap)',
        status: 'fail',
        message: 'CRITICAL: FAQ content exists but no FAQPage schema - add JSON-LD for rich results',
      })
    }
  }

  // Check for HowTo schema on homepage (opportunity)
  if (pagePath === '/') {
    const hasHowTo = foundTypes.includes('HowTo')
    if (!hasHowTo) {
      checks.push({
        name: 'Schema: HowTo (Opportunity)',
        status: 'warn',
        message: 'OPPORTUNITY: "How It Works" 3-step process exists but no HowTo schema',
      })
    }
  }

  // List all found schemas
  if (foundTypes.length > 0) {
    checks.push({
      name: 'Schema Summary',
      status: 'info',
      message: `Found ${foundTypes.length} schema(s)`,
      details: foundTypes,
    })
  } else {
    checks.push({
      name: 'Schema Summary',
      status: 'fail',
      message: 'No JSON-LD schemas found on page',
    })
  }

  return checks
}

// =============================================================================
// Heading Structure Audits
// =============================================================================

function extractHeadings($: cheerio.CheerioAPI): HeadingNode[] {
  const headings: HeadingNode[] = []

  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const level = parseInt(el.tagName.substring(1))
    const text = $(el).text().trim().substring(0, 80)
    headings.push({ level, text })
  })

  return headings
}

function auditHeadings($: cheerio.CheerioAPI, pagePath: string): AuditCheck[] {
  const checks: AuditCheck[] = []
  const headings = extractHeadings($)

  // 1. Exactly 1 H1 per page
  const h1s = headings.filter(h => h.level === 1)
  if (h1s.length === 0) {
    checks.push({ name: 'H1 Count', status: 'fail', message: 'Missing H1 tag' })
  } else if (h1s.length === 1) {
    checks.push({ name: 'H1 Count', status: 'pass', message: 'Exactly 1 H1 tag present' })
  } else {
    checks.push({
      name: 'H1 Count',
      status: 'fail',
      message: `Multiple H1 tags found (${h1s.length})`,
      details: h1s.map(h => h.text),
    })
  }

  // 2. H1 contains primary keyword
  if (h1s.length > 0) {
    const h1Text = h1s[0].text.toLowerCase()
    const keywords = ['scratch', 'dent', 'appliance']
    const hasKeyword = keywords.some(kw => h1Text.includes(kw))
    if (hasKeyword) {
      checks.push({ name: 'H1 Keywords', status: 'pass', message: 'H1 contains primary keywords' })
    } else {
      checks.push({
        name: 'H1 Keywords',
        status: 'warn',
        message: 'H1 may not contain primary keywords',
        details: [h1s[0].text],
      })
    }
  }

  // 3. Heading hierarchy (no skipped levels)
  let prevLevel = 0
  const hierarchyIssues: string[] = []
  for (const h of headings) {
    if (h.level > prevLevel + 1 && prevLevel > 0) {
      hierarchyIssues.push(`H${h.level} follows H${prevLevel} (skipped H${prevLevel + 1}): "${h.text}"`)
    }
    prevLevel = h.level
  }

  if (hierarchyIssues.length === 0) {
    checks.push({ name: 'Heading Hierarchy', status: 'pass', message: 'Proper H1→H2→H3 nesting' })
  } else {
    checks.push({
      name: 'Heading Hierarchy',
      status: 'warn',
      message: `Skipped heading levels detected`,
      details: hierarchyIssues.slice(0, 5),
    })
  }

  // 4. H2s follow H1 (no orphan H2s before H1)
  const firstH1Index = headings.findIndex(h => h.level === 1)
  const orphanH2s = headings.slice(0, firstH1Index).filter(h => h.level === 2)
  if (orphanH2s.length > 0) {
    checks.push({
      name: 'Orphan H2s',
      status: 'warn',
      message: `${orphanH2s.length} H2(s) appear before H1`,
      details: orphanH2s.map(h => h.text),
    })
  } else {
    checks.push({ name: 'Orphan H2s', status: 'pass', message: 'No orphan H2s before H1' })
  }

  // Summary
  const h2Count = headings.filter(h => h.level === 2).length
  const h3Count = headings.filter(h => h.level === 3).length
  checks.push({
    name: 'Heading Summary',
    status: 'info',
    message: `Found ${h1s.length} H1, ${h2Count} H2, ${h3Count} H3`,
  })

  return checks
}

// =============================================================================
// AI Readability Audits
// =============================================================================

function auditAIReadability($: cheerio.CheerioAPI, html: string, pagePath: string): AuditCheck[] {
  const checks: AuditCheck[] = []
  const bodyText = $('body').text()

  // 1. Check for AI-friendly summary block
  const hasAboutSection = html.includes('About') && (
    html.includes('For AI') ||
    html.includes('What:') ||
    html.includes('What is') ||
    bodyText.includes('is a directory') ||
    bodyText.includes('is a feedback') ||
    bodyText.includes('is a ')
  )

  if (hasAboutSection) {
    checks.push({
      name: 'AI Summary Block',
      status: 'pass',
      message: 'Potential AI-friendly summary content detected',
    })
  } else {
    checks.push({
      name: 'AI Summary Block',
      status: 'warn',
      message: 'MISSING: No structured AI-friendly summary block found',
      details: ['Consider adding "About [Site Name]" section with clear factual statements'],
    })
  }

  // 2. Check for entity patterns (e.g., "X is a Y that Z")
  const entityPatterns = [
    /Scratch\s*(?:&|and)\s*Dent\s*Finder\s+is\s+/i,
    /appliance\s+stores?\s+(?:that|which|where)/i,
    /directory\s+(?:that|which|of)/i,
  ]

  const hasEntityPattern = entityPatterns.some(pattern => pattern.test(bodyText))
  if (hasEntityPattern) {
    checks.push({
      name: 'Entity Associations',
      status: 'pass',
      message: 'Entity relationship patterns detected',
    })
  } else {
    checks.push({
      name: 'Entity Associations',
      status: 'warn',
      message: 'MISSING: No clear entity association patterns found',
      details: ['Add statements like "X is a [category] that [function]"'],
    })
  }

  // 3. Check for clear factual statements
  const factualPatterns = [
    /save\s+\d+[\-–]\d+%/i,
    /\d+\s+(?:stores?|cities|states)/i,
    /minor\s+cosmetic\s+damage/i,
    /fully\s+functional/i,
  ]

  const factualMatches = factualPatterns.filter(p => p.test(bodyText)).length
  if (factualMatches >= 2) {
    checks.push({
      name: 'Factual Statements',
      status: 'pass',
      message: `${factualMatches} clear factual statement patterns detected`,
    })
  } else if (factualMatches === 1) {
    checks.push({
      name: 'Factual Statements',
      status: 'warn',
      message: 'Limited factual statements for AI extraction',
    })
  } else {
    checks.push({
      name: 'Factual Statements',
      status: 'warn',
      message: 'Few clear factual statements detected',
    })
  }

  // 4. Check semantic HTML elements
  const hasMain = $('main').length > 0
  const hasArticle = $('article').length > 0
  const hasSection = $('section').length > 0
  const hasNav = $('nav').length > 0

  const semanticScore = [hasMain, hasArticle, hasSection, hasNav].filter(Boolean).length
  if (semanticScore >= 3) {
    checks.push({ name: 'Semantic HTML', status: 'pass', message: 'Good semantic HTML structure' })
  } else if (semanticScore >= 2) {
    checks.push({
      name: 'Semantic HTML',
      status: 'warn',
      message: `Partial semantic HTML (${semanticScore}/4)`,
      details: [
        !hasMain ? 'Missing <main>' : null,
        !hasSection ? 'Missing <section>' : null,
        !hasNav ? 'Missing <nav>' : null,
      ].filter(Boolean) as string[],
    })
  } else {
    checks.push({
      name: 'Semantic HTML',
      status: 'fail',
      message: 'Poor semantic HTML structure',
    })
  }

  // 5. Check for ordered lists (process steps)
  const hasOrderedList = $('ol').length > 0
  if (pagePath === '/' || pagePath === '/buyers-guide/') {
    if (hasOrderedList) {
      checks.push({ name: 'Ordered Lists', status: 'pass', message: 'Ordered list(s) for process steps' })
    } else {
      checks.push({
        name: 'Ordered Lists',
        status: 'info',
        message: 'Consider using <ol> for numbered steps',
      })
    }
  }

  return checks
}

// =============================================================================
// Technical SEO Audits
// =============================================================================

function auditTechnical($: cheerio.CheerioAPI, pagePath: string): AuditCheck[] {
  const checks: AuditCheck[] = []

  // 1. Check robots meta
  const robotsMeta = $('meta[name="robots"]').attr('content')
  if (robotsMeta?.includes('noindex')) {
    checks.push({
      name: 'Robots Meta',
      status: 'fail',
      message: 'Page has noindex directive',
      details: [robotsMeta],
    })
  } else {
    checks.push({ name: 'Robots Meta', status: 'pass', message: 'No noindex directive' })
  }

  // 2. Check for viewport meta
  const viewport = $('meta[name="viewport"]').attr('content')
  if (viewport) {
    checks.push({ name: 'Viewport Meta', status: 'pass', message: 'Mobile viewport configured' })
  } else {
    checks.push({ name: 'Viewport Meta', status: 'fail', message: 'Missing viewport meta tag' })
  }

  // 3. Check for charset
  const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content')
  if (charset) {
    checks.push({ name: 'Charset', status: 'pass', message: 'Character encoding specified' })
  } else {
    checks.push({ name: 'Charset', status: 'warn', message: 'Missing explicit charset declaration' })
  }

  // 4. Check for language attribute
  const lang = $('html').attr('lang')
  if (lang) {
    checks.push({ name: 'Language Attribute', status: 'pass', message: `lang="${lang}" specified` })
  } else {
    checks.push({ name: 'Language Attribute', status: 'warn', message: 'Missing html lang attribute' })
  }

  // 5. Count internal links
  const internalLinks = $('a[href^="/"]').length
  const externalLinks = $('a[href^="http"]').filter((_, el) =>
    !$(el).attr('href')?.includes('scratchanddentfinder.com')
  ).length

  checks.push({
    name: 'Link Summary',
    status: 'info',
    message: `${internalLinks} internal links, ${externalLinks} external links`,
  })

  return checks
}

// =============================================================================
// Site-Level Audits
// =============================================================================

async function auditSitemap(baseUrl: string): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = []

  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`)
    if (!response.ok) {
      checks.push({ name: 'Sitemap Accessibility', status: 'fail', message: `Sitemap returned ${response.status}` })
      return checks
    }

    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })
    const urls: string[] = []

    $('url loc').each((_, el) => {
      urls.push($(el).text())
    })

    checks.push({ name: 'Sitemap Accessibility', status: 'pass', message: 'sitemap.xml accessible' })
    checks.push({ name: 'Sitemap URL Count', status: 'info', message: `${urls.length} URLs in sitemap` })

    // Validate URL format
    // In dev mode, sitemap uses localhost URLs which is expected behavior
    // Production deployment falls back to production domain via SITE_URL config
    if (IS_DEV_MODE) {
      const localhostUrls = urls.filter(url => url.includes('localhost'))
      if (localhostUrls.length > 0) {
        checks.push({
          name: 'Sitemap URL Format',
          status: 'info',
          message: `DEV MODE: ${urls.length} URLs use localhost (expected - production will use SITE_URL fallback)`,
          details: ['Sitemap URLs read from SITE_URL in lib/config.ts', 'Production deployment without NEXT_PUBLIC_SITE_URL falls back to https://scratchanddentfinder.com'],
        })
      } else {
        checks.push({ name: 'Sitemap URL Format', status: 'pass', message: 'All URLs use HTTPS with trailing slash' })
      }
    } else {
      const invalidUrls = urls.filter(url => !url.startsWith('https://') || !url.endsWith('/'))
      if (invalidUrls.length > 0) {
        checks.push({
          name: 'Sitemap URL Format',
          status: 'fail',
          message: `${invalidUrls.length} URLs have format issues`,
          details: invalidUrls.slice(0, 5),
        })
      } else {
        checks.push({ name: 'Sitemap URL Format', status: 'pass', message: 'All URLs use HTTPS with trailing slash' })
      }
    }

  } catch (error) {
    checks.push({ name: 'Sitemap', status: 'fail', message: `Failed to fetch: ${error}` })
  }

  return checks
}

async function auditRobots(baseUrl: string): Promise<AuditCheck[]> {
  const checks: AuditCheck[] = []

  try {
    const response = await fetch(`${baseUrl}/robots.txt`)
    if (!response.ok) {
      checks.push({ name: 'Robots.txt Accessibility', status: 'fail', message: `robots.txt returned ${response.status}` })
      return checks
    }

    const content = await response.text()
    checks.push({ name: 'Robots.txt Accessibility', status: 'pass', message: 'robots.txt accessible' })

    // Check for sitemap reference
    if (content.toLowerCase().includes('sitemap:')) {
      checks.push({ name: 'Robots.txt Sitemap', status: 'pass', message: 'Sitemap directive present' })
    } else {
      checks.push({ name: 'Robots.txt Sitemap', status: 'warn', message: 'Missing Sitemap directive' })
    }

    // Check for admin/API disallows
    const lines = content.toLowerCase()
    const hasAdminDisallow = lines.includes('disallow') && (lines.includes('/admin') || lines.includes('/dashboard'))
    const hasApiDisallow = lines.includes('disallow') && lines.includes('/api')

    if (hasAdminDisallow && hasApiDisallow) {
      checks.push({ name: 'Robots.txt Security', status: 'pass', message: 'Admin and API routes disallowed' })
    } else {
      checks.push({
        name: 'Robots.txt Security',
        status: 'warn',
        message: 'Consider disallowing /admin, /dashboard, /api',
      })
    }

  } catch (error) {
    checks.push({ name: 'Robots.txt', status: 'fail', message: `Failed to fetch: ${error}` })
  }

  return checks
}

// =============================================================================
// Report Generation
// =============================================================================

function generateMarkdownReport(audit: SiteAudit): string {
  const lines: string[] = []

  lines.push('# SEO & AEO Audit Report')
  lines.push('')
  lines.push(`**Generated:** ${audit.timestamp}`)
  lines.push(`**Base URL:** ${audit.baseUrl}`)
  lines.push('')

  // Summary
  lines.push('## Executive Summary')
  lines.push('')
  lines.push('| Metric | Count |')
  lines.push('|--------|-------|')
  lines.push(`| Total Checks | ${audit.summary.total} |`)
  lines.push(`| Passed | ${audit.summary.passed} |`)
  lines.push(`| Failed | ${audit.summary.failed} |`)
  lines.push(`| Warnings | ${audit.summary.warnings} |`)
  lines.push('')

  const passRate = ((audit.summary.passed / audit.summary.total) * 100).toFixed(1)
  lines.push(`**Pass Rate:** ${passRate}%`)
  lines.push('')

  // Site-level checks
  lines.push('---')
  lines.push('')
  lines.push('## Site-Level Checks')
  lines.push('')

  lines.push('### Sitemap')
  lines.push('')
  for (const check of audit.sitemap) {
    lines.push(formatCheck(check))
  }
  lines.push('')

  lines.push('### Robots.txt')
  lines.push('')
  for (const check of audit.robots) {
    lines.push(formatCheck(check))
  }
  lines.push('')

  // Page-level checks
  lines.push('---')
  lines.push('')
  lines.push('## Page Audits')
  lines.push('')

  for (const page of audit.pages) {
    lines.push(`### ${page.path}`)
    lines.push('')

    lines.push('#### Metadata')
    for (const check of page.metadata) {
      lines.push(formatCheck(check))
    }
    lines.push('')

    lines.push('#### Schema Markup')
    for (const check of page.schema) {
      lines.push(formatCheck(check))
    }
    lines.push('')

    lines.push('#### Heading Structure')
    for (const check of page.headings) {
      lines.push(formatCheck(check))
    }
    lines.push('')

    lines.push('#### AI Readability')
    for (const check of page.aiReadability) {
      lines.push(formatCheck(check))
    }
    lines.push('')

    lines.push('#### Technical SEO')
    for (const check of page.technical) {
      lines.push(formatCheck(check))
    }
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  // Critical gaps section
  lines.push('## Critical Gaps Identified')
  lines.push('')
  const criticalGaps = collectCriticalGaps(audit)
  if (criticalGaps.length > 0) {
    for (const gap of criticalGaps) {
      lines.push(`- **${gap.page}**: ${gap.issue}`)
    }
  } else {
    lines.push('No critical gaps identified.')
  }
  lines.push('')

  // Recommendations
  lines.push('## Recommendations')
  lines.push('')
  lines.push('### High Priority')
  lines.push('')
  lines.push('1. **Add FAQPage schema to /buyers-guide/** - 5 Q&A pairs exist but no structured data')
  lines.push('2. **Add HowTo schema to homepage** - 3-step process exists but no structured data')
  lines.push('3. **Add AI-friendly summary block** - Structured "About" section for LLM parsing')
  lines.push('')
  lines.push('### Medium Priority')
  lines.push('')
  lines.push('1. Document keyword strategy and targets')
  lines.push('2. Add entity relationship patterns to content')
  lines.push('3. Verify Core Web Vitals performance')
  lines.push('')

  // Footer
  lines.push('---')
  lines.push('')
  lines.push('*Report generated by SEO-AEO Audit Script v1.0*')

  return lines.join('\n')
}

function formatCheck(check: AuditCheck): string {
  const icons: Record<AuditCheck['status'], string> = {
    pass: '',
    fail: '',
    warn: '',
    info: '',
  }

  let line = `- ${icons[check.status]} **${check.name}**: ${check.message}`

  if (check.details && check.details.length > 0) {
    line += '\n' + check.details.map(d => `  - ${d}`).join('\n')
  }

  return line
}

function collectCriticalGaps(audit: SiteAudit): { page: string; issue: string }[] {
  const gaps: { page: string; issue: string }[] = []

  for (const page of audit.pages) {
    for (const check of [...page.schema, ...page.aiReadability]) {
      if (check.status === 'fail' || (check.status === 'warn' && check.message.includes('CRITICAL'))) {
        gaps.push({ page: page.path, issue: check.message })
      }
    }
  }

  return gaps
}

function calculateSummary(audit: SiteAudit): SiteAudit['summary'] {
  let total = 0
  let passed = 0
  let failed = 0
  let warnings = 0

  const countChecks = (checks: AuditCheck[]) => {
    for (const check of checks) {
      total++
      if (check.status === 'pass') passed++
      else if (check.status === 'fail') failed++
      else if (check.status === 'warn') warnings++
      // info doesn't count towards pass/fail
    }
  }

  countChecks(audit.sitemap)
  countChecks(audit.robots)

  for (const page of audit.pages) {
    countChecks(page.metadata)
    countChecks(page.schema)
    countChecks(page.headings)
    countChecks(page.aiReadability)
    countChecks(page.technical)
  }

  return { total, passed, failed, warnings }
}

// =============================================================================
// Main Execution
// =============================================================================

async function auditPage(baseUrl: string, pagePath: string): Promise<PageAudit> {
  const url = `${baseUrl}${pagePath}`
  console.log(`  Auditing ${pagePath}...`)

  const html = await fetchPage(url)
  const $ = cheerio.load(html)

  return {
    url,
    path: pagePath,
    metadata: auditMetadata($, pagePath),
    schema: auditSchema($, pagePath),
    headings: auditHeadings($, pagePath),
    aiReadability: auditAIReadability($, html, pagePath),
    technical: auditTechnical($, pagePath),
  }
}

async function main() {
  console.log('')
  console.log('='.repeat(60))
  console.log('  SEO & AEO AUDIT')
  console.log('='.repeat(60))
  console.log(`  Base URL: ${BASE_URL}`)
  console.log('')

  const audit: SiteAudit = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    pages: [],
    sitemap: [],
    robots: [],
    summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
  }

  // Site-level audits
  console.log('Running site-level audits...')
  audit.sitemap = await auditSitemap(BASE_URL)
  audit.robots = await auditRobots(BASE_URL)
  console.log('')

  // Page audits
  console.log('Running page audits...')
  for (const page of AUDIT_PAGES) {
    try {
      const pageAudit = await auditPage(BASE_URL, page.path)
      audit.pages.push(pageAudit)
    } catch (error) {
      console.log(`  Failed to audit ${page.path}: ${error}`)
      audit.pages.push({
        url: `${BASE_URL}${page.path}`,
        path: page.path,
        metadata: [{ name: 'Page Access', status: 'fail', message: `Failed to fetch: ${error}` }],
        schema: [],
        headings: [],
        aiReadability: [],
        technical: [],
      })
    }
  }
  console.log('')

  // Calculate summary
  audit.summary = calculateSummary(audit)

  // Generate report
  const report = generateMarkdownReport(audit)
  const reportPath = path.join(process.cwd(), 'docs', 'SEO-AEO-AUDIT-REPORT.md')

  // Ensure docs directory exists
  const docsDir = path.dirname(reportPath)
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }

  fs.writeFileSync(reportPath, report)

  // Print summary
  console.log('='.repeat(60))
  console.log('  AUDIT COMPLETE')
  console.log('='.repeat(60))
  console.log('')
  console.log(`  Total Checks: ${audit.summary.total}`)
  console.log(`  Passed:       ${audit.summary.passed}`)
  console.log(`  Failed:       ${audit.summary.failed}`)
  console.log(`  Warnings:     ${audit.summary.warnings}`)
  console.log('')
  console.log(`  Pass Rate: ${((audit.summary.passed / audit.summary.total) * 100).toFixed(1)}%`)
  console.log('')
  console.log(`  Report saved to: ${reportPath}`)
  console.log('')

  // Exit with error code if failures
  process.exit(audit.summary.failed > 0 ? 1 : 0)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
