#!/usr/bin/env node
/**
 * Store Email Scraper
 *
 * Scrapes contact emails from store websites and writes to store_emails table.
 * Resume-friendly: skips stores already in store_emails.
 *
 * Usage: node scripts/scrape-store-emails.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
} catch {
  console.error('Could not read .env.local — set env vars manually')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// --- Config ---
const RATE_LIMIT_MS = 500 // 2 req/sec
const FETCH_TIMEOUT_MS = 5000
const CONTACT_PATHS = ['/contact', '/about', '/contact-us', '/about-us']
const SKIP_DOMAINS = ['facebook.com', 'instagram.com', 'twitter.com', 'yelp.com', 'google.com', 'tiktok.com', 'youtube.com']
const SKIP_EMAIL_PATTERNS = [/^noreply@/i, /^no-reply@/i, /^mailer-daemon@/i, /^postmaster@/i, /^webmaster@/i, /^admin@/i, /^root@/i, /^test@/i, /^example@/i]

// Email regex — matches standard email format
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function isValidEmail(email) {
  const lower = email.toLowerCase()
  // Skip spam-trap patterns
  if (SKIP_EMAIL_PATTERNS.some(p => p.test(lower))) return false
  // Skip image file extensions sometimes caught by regex
  if (/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(lower)) return false
  // Must have valid TLD
  const parts = lower.split('@')
  if (parts.length !== 2) return false
  const domain = parts[1]
  if (!domain.includes('.')) return false
  // Skip if domain is a known social/review site
  if (SKIP_DOMAINS.some(d => domain.endsWith(d))) return false
  return true
}

async function fetchPage(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ScratchAndDentFinder/1.0; +https://scratchanddentfinder.com)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function extractEmails(html) {
  if (!html) return []
  // Extract from mailto: links
  const mailtoRegex = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi
  const mailtoMatches = [...html.matchAll(mailtoRegex)].map(m => m[1].toLowerCase())

  // Extract from page text
  const textMatches = [...html.matchAll(EMAIL_REGEX)].map(m => m[0].toLowerCase())

  // Deduplicate and filter
  const unique = [...new Set([...mailtoMatches, ...textMatches])]
  return unique.filter(isValidEmail)
}

function normalizeUrl(website) {
  let url = website.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  // Remove trailing slash for consistent base
  return url.replace(/\/+$/, '')
}

async function scrapeStore(store) {
  const baseUrl = normalizeUrl(store.website)
  const allEmails = new Set()

  // Fetch main page
  const mainHtml = await fetchPage(baseUrl)
  for (const email of extractEmails(mainHtml)) {
    allEmails.add(email)
  }

  // If no emails on main page, try contact pages
  if (allEmails.size === 0) {
    for (const path of CONTACT_PATHS) {
      await sleep(RATE_LIMIT_MS)
      const html = await fetchPage(baseUrl + path)
      for (const email of extractEmails(html)) {
        allEmails.add(email)
      }
      if (allEmails.size > 0) break // Found emails, stop
    }
  }

  return [...allEmails]
}

async function main() {
  console.log('=== Store Email Scraper ===\n')

  // Get stores already scraped (for resume)
  const { data: existing } = await supabase
    .from('store_emails')
    .select('store_id')

  const scrapedIds = new Set((existing || []).map(e => e.store_id))
  console.log(`Already scraped: ${scrapedIds.size} stores`)

  // Get all stores with websites
  let allStores = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, website')
      .not('website', 'is', null)
      .range(from, from + PAGE - 1)

    if (error) {
      console.error('Error fetching stores:', error)
      process.exit(1)
    }
    if (!data || data.length === 0) break
    allStores = allStores.concat(data)
    if (data.length < PAGE) break
    from += PAGE
  }

  // Filter out already scraped and stores with empty website
  const toScrape = allStores.filter(
    s => s.website && s.website.trim() && !scrapedIds.has(s.id)
  )

  console.log(`Stores with website: ${allStores.length}`)
  console.log(`Remaining to scrape: ${toScrape.length}\n`)

  if (toScrape.length === 0) {
    console.log('Nothing to scrape. Done.')
    return
  }

  let found = 0
  let failed = 0
  let noEmail = 0

  for (let i = 0; i < toScrape.length; i++) {
    const store = toScrape[i]

    // Progress every 50 stores
    if (i > 0 && i % 50 === 0) {
      console.log(`[${i}/${toScrape.length}] Found: ${found} | No email: ${noEmail} | Failed: ${failed}`)
    }

    try {
      const emails = await scrapeStore(store)

      if (emails.length > 0) {
        // Insert emails into store_emails
        const rows = emails.map(email => ({
          store_id: store.id,
          email,
          source: 'website_scrape',
        }))

        const { error } = await supabase
          .from('store_emails')
          .upsert(rows, { onConflict: 'store_id,email' })

        if (error) {
          console.error(`  DB error for ${store.name}: ${error.message}`)
          failed++
        } else {
          found++
        }
      } else {
        noEmail++
      }
    } catch (err) {
      failed++
    }

    await sleep(RATE_LIMIT_MS)
  }

  // Final stats
  console.log('\n=== Final Stats ===')
  console.log(`Total scraped: ${toScrape.length}`)
  console.log(`Emails found: ${found}`)
  console.log(`No email: ${noEmail}`)
  console.log(`Failed: ${failed}`)
  console.log(`Hit rate: ${((found / toScrape.length) * 100).toFixed(1)}%`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
