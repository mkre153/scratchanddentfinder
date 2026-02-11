#!/usr/bin/env node

/**
 * generate-audio.mjs
 *
 * Generates MP3 audio narrations for blog posts using OpenAI TTS API.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-audio.mjs
 *   OPENAI_API_KEY=sk-... node scripts/generate-audio.mjs --force
 *
 * Reads posts from .velite/posts.json (falls back to reading MDX files).
 * Also reads reviews from .velite/reviews.json (falls back to content/reviews/).
 * Saves MP3 files to public/audio/[slug].mp3.
 * Skips posts that already have an audio file unless --force is passed.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const AUDIO_DIR = path.join(ROOT, 'public', 'audio')
const FORCE = process.argv.includes('--force')

// ── Helpers ──────────────────────────────────────────────────────

function stripFrontmatter(text) {
  return text.replace(/^---[\s\S]*?---\n*/, '')
}

function stripMdxComponents(text) {
  // Remove import statements
  let clean = text.replace(/^import\s+.*$/gm, '')
  // Remove JSX self-closing tags like <Component ... />
  clean = clean.replace(/<[A-Z][A-Za-z]*\s*[^>]*\/>/g, '')
  // Remove JSX open/close tags and their content (single-line)
  clean = clean.replace(/<[A-Z][A-Za-z]*[^>]*>[\s\S]*?<\/[A-Z][A-Za-z]*>/g, '')
  // Remove remaining JSX-like tags
  clean = clean.replace(/<\/?[A-Z][A-Za-z]*[^>]*>/g, '')
  // Remove HTML comments
  clean = clean.replace(/<!--[\s\S]*?-->/g, '')
  // Remove markdown images
  clean = clean.replace(/!\[.*?\]\(.*?\)/g, '')
  // Convert markdown links to just the text
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  // Remove markdown bold/italic markers
  clean = clean.replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2')
  // Remove markdown headings markers (keep text)
  clean = clean.replace(/^#{1,6}\s+/gm, '')
  // Remove code blocks
  clean = clean.replace(/```[\s\S]*?```/g, '')
  // Remove inline code
  clean = clean.replace(/`([^`]+)`/g, '$1')
  // Remove horizontal rules
  clean = clean.replace(/^[-*_]{3,}\s*$/gm, '')
  // Remove list markers
  clean = clean.replace(/^\s*[-*+]\s+/gm, '')
  clean = clean.replace(/^\s*\d+\.\s+/gm, '')
  // Collapse multiple newlines
  clean = clean.replace(/\n{3,}/g, '\n\n')
  return clean.trim()
}

// ── Load posts ───────────────────────────────────────────────────

async function loadPosts() {
  // Try .velite/posts.json first
  const velitePath = path.join(ROOT, '.velite', 'posts.json')
  if (fs.existsSync(velitePath)) {
    console.log('[info] Loading posts from .velite/posts.json')
    const raw = fs.readFileSync(velitePath, 'utf-8')
    const posts = JSON.parse(raw)
    return posts
      .filter((p) => !p.draft)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        text: stripMdxComponents(p.raw || p.body || ''),
      }))
  }

  // Fallback: read MDX files from content/blog/
  console.log('[info] Falling back to reading MDX files from content/blog/')
  const blogDir = path.join(ROOT, 'content', 'blog')
  if (!fs.existsSync(blogDir)) {
    console.error('[error] No blog content found at', blogDir)
    process.exit(1)
  }

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx'))
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8')
    const body = stripFrontmatter(raw)
    // Extract slug from frontmatter
    const slugMatch = raw.match(/^slug:\s*["']?([^"'\n]+)["']?/m)
    const slug = slugMatch ? slugMatch[1].trim() : path.basename(file, '.mdx')
    // Check draft status
    const draftMatch = raw.match(/^draft:\s*(true|false)/m)
    const draft = draftMatch ? draftMatch[1] === 'true' : false
    // Extract title
    const titleMatch = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)
    const title = titleMatch ? titleMatch[1] : slug

    return { slug, title, text: stripMdxComponents(body), draft }
  }).filter((p) => !p.draft)
}

// ── Load reviews ────────────────────────────────────────────────

async function loadReviews() {
  // Try .velite/reviews.json first
  const velitePath = path.join(ROOT, '.velite', 'reviews.json')
  if (fs.existsSync(velitePath)) {
    console.log('[info] Loading reviews from .velite/reviews.json')
    const raw = fs.readFileSync(velitePath, 'utf-8')
    const reviews = JSON.parse(raw)
    return reviews
      .filter((r) => !r.draft)
      .map((r) => ({
        slug: r.slug,
        title: r.title,
        text: stripMdxComponents(r.raw || r.body || ''),
      }))
  }

  // Fallback: read MDX files from content/reviews/
  console.log('[info] Falling back to reading MDX files from content/reviews/')
  const reviewsDir = path.join(ROOT, 'content', 'reviews')
  if (!fs.existsSync(reviewsDir)) {
    console.log('[info] No reviews content found at', reviewsDir)
    return []
  }

  const files = fs.readdirSync(reviewsDir).filter((f) => f.endsWith('.mdx'))
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(reviewsDir, file), 'utf-8')
    const body = stripFrontmatter(raw)
    const slugMatch = raw.match(/^slug:\s*["']?([^"'\n]+)["']?/m)
    const slug = slugMatch ? slugMatch[1].trim() : path.basename(file, '.mdx')
    const draftMatch = raw.match(/^draft:\s*(true|false)/m)
    const draft = draftMatch ? draftMatch[1] === 'true' : false
    const titleMatch = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)
    const title = titleMatch ? titleMatch[1] : slug

    return { slug, title, text: stripMdxComponents(body), draft }
  }).filter((r) => !r.draft)
}

// ── TTS generation ───────────────────────────────────────────────

async function generateAudio(text, outputPath) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('[error] OPENAI_API_KEY environment variable is required')
    process.exit(1)
  }

  // OpenAI TTS has a 4096 character limit per request.
  // For longer texts, we split into chunks and concatenate the audio buffers.
  const MAX_CHARS = 4096
  const chunks = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHARS) {
      chunks.push(remaining)
      break
    }
    // Find a good break point (end of sentence or paragraph)
    let breakIdx = remaining.lastIndexOf('. ', MAX_CHARS)
    if (breakIdx === -1 || breakIdx < MAX_CHARS * 0.5) {
      breakIdx = remaining.lastIndexOf(' ', MAX_CHARS)
    }
    if (breakIdx === -1) {
      breakIdx = MAX_CHARS
    }
    chunks.push(remaining.slice(0, breakIdx + 1))
    remaining = remaining.slice(breakIdx + 1)
  }

  const audioBuffers = []

  for (let i = 0; i < chunks.length; i++) {
    if (chunks.length > 1) {
      process.stdout.write(`  chunk ${i + 1}/${chunks.length}... `)
    }

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'alloy',
        input: chunks[i],
        response_format: 'mp3',
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      throw new Error(`OpenAI TTS API error ${res.status}: ${errBody}`)
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    audioBuffers.push(buffer)

    if (chunks.length > 1) {
      console.log('done')
    }
  }

  // Concatenate MP3 buffers (MP3 frames are independently decodable)
  const combined = Buffer.concat(audioBuffers)
  fs.writeFileSync(outputPath, combined)
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log('=== Scratch & Dent Finder — Audio Narration Generator ===\n')

  // Ensure output directory exists
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true })
    console.log('[info] Created', AUDIO_DIR)
  }

  const posts = await loadPosts()
  const reviews = await loadReviews()
  const allContent = [
    ...posts.map((p) => ({ ...p, type: 'blog' })),
    ...reviews.map((r) => ({ ...r, type: 'review' })),
  ]
  console.log(`[info] Found ${posts.length} blog posts + ${reviews.length} reviews = ${allContent.length} total\n`)

  let generated = 0
  let skipped = 0

  for (const item of allContent) {
    const outPath = path.join(AUDIO_DIR, `${item.slug}.mp3`)

    if (fs.existsSync(outPath) && !FORCE) {
      console.log(`[skip] ${item.slug} (${item.type}) — audio already exists`)
      skipped++
      continue
    }

    if (!item.text || item.text.length < 50) {
      console.log(`[skip] ${item.slug} (${item.type}) — content too short (${item.text?.length || 0} chars)`)
      skipped++
      continue
    }

    console.log(`[gen]  ${item.slug} (${item.type}, ${item.text.length} chars)`)

    try {
      await generateAudio(item.text, outPath)
      const size = fs.statSync(outPath).size
      console.log(`       → saved ${(size / 1024).toFixed(0)} KB`)
      generated++
    } catch (err) {
      console.error(`[error] ${item.slug}: ${err.message}`)
    }
  }

  console.log(`\n=== Done: ${generated} generated, ${skipped} skipped ===`)
}

main().catch((err) => {
  console.error('[fatal]', err)
  process.exit(1)
})
