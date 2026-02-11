#!/usr/bin/env node

/**
 * IndexNow Notify Script
 *
 * Reads the sitemap and submits URLs to Bing's IndexNow API.
 * Run after deploy: node scripts/indexnow-notify.mjs
 *
 * Options:
 *   --limit N    Submit at most N URLs (default: 100)
 *   --dry-run    Print URLs without submitting
 */

const SITE_URL = 'https://scratchanddentfinder.com'
const INDEX_NOW_KEY = 'c1d1a8c63a035bc21bb954e327d9a8a2'
const INDEX_NOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const limitIdx = args.indexOf('--limit')
const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 100

async function fetchSitemap() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`)
  if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status}`)
  const xml = await res.text()

  // Extract URLs from <loc> tags
  const urls = []
  const regex = /<loc>([^<]+)<\/loc>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1])
  }
  return urls
}

async function submitToIndexNow(urls) {
  const body = {
    host: 'scratchanddentfinder.com',
    key: INDEX_NOW_KEY,
    keyLocation: `${SITE_URL}/${INDEX_NOW_KEY}.txt`,
    urlList: urls,
  }

  const res = await fetch(INDEX_NOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return { status: res.status, ok: res.ok }
}

async function main() {
  console.log('Fetching sitemap...')
  const allUrls = await fetchSitemap()
  console.log(`Found ${allUrls.length} URLs in sitemap`)

  const urls = allUrls.slice(0, limit)
  console.log(`Submitting ${urls.length} URLs (limit: ${limit})`)

  if (dryRun) {
    console.log('\n[DRY RUN] Would submit:')
    urls.forEach((url) => console.log(`  ${url}`))
    return
  }

  // IndexNow accepts up to 10,000 URLs per batch
  const batchSize = 10000
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    const result = await submitToIndexNow(batch)
    console.log(`Batch ${Math.floor(i / batchSize) + 1}: ${result.status} (${result.ok ? 'OK' : 'FAILED'})`)
  }

  console.log('Done!')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
