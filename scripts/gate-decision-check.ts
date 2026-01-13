#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'
import process from 'process'

/**
 * Gate Decision Enforcement
 *
 * Fails if a slice closure document does not include:
 *   ## 6. Gate Decision (Required)
 *
 * Usage:
 *   npx tsx scripts/gate-decision-check.ts docs/slices/slice-8-closure.md
 */

const REQUIRED_HEADER = '## 6. Gate Decision (Required)'

function fail(message: string): never {
  console.error(`❌ Gate Decision Check FAILED\n`)
  console.error(message)
  process.exit(1)
}

function pass(message: string) {
  console.log(`✅ Gate Decision Check PASSED`)
  console.log(message)
}

const filePath = process.argv[2]

if (!filePath) {
  fail(
    `No slice closure file provided.\n\n` +
    `Usage:\n  npx tsx scripts/gate-decision-check.ts <slice-closure-file>`
  )
}

const resolvedPath = path.resolve(filePath)

if (!fs.existsSync(resolvedPath)) {
  fail(`Slice closure file not found:\n  ${resolvedPath}`)
}

const content = fs.readFileSync(resolvedPath, 'utf8')

if (!content.includes(REQUIRED_HEADER)) {
  fail(
    `Missing required section:\n\n` +
    `  ${REQUIRED_HEADER}\n\n` +
    `Every slice must explicitly decide whether a new gate is required.\n` +
    `If no gate is needed, document why.`
  )
}

/**
 * Ensure the section has content (not just the header)
 * Find content between this header and the next ## header
 */
const headerIndex = content.indexOf(REQUIRED_HEADER)
const afterHeader = content.slice(headerIndex + REQUIRED_HEADER.length)

// Find the next ## section (but not ### subsections)
const nextSectionMatch = afterHeader.match(/\n## [^#]/)
const sectionEnd = nextSectionMatch
  ? afterHeader.indexOf(nextSectionMatch[0])
  : afterHeader.length

const sectionBody = afterHeader.slice(0, sectionEnd).trim()

// Remove markdown formatting to check for actual content
const contentOnly = sectionBody
  .replace(/^#+\s+.*/gm, '') // Remove headers
  .replace(/^[-*]\s+/gm, '') // Remove list markers
  .replace(/^>/gm, '') // Remove blockquotes
  .replace(/\*\*/g, '') // Remove bold
  .replace(/[☐⚠️]/g, '') // Remove checkboxes and emojis
  .replace(/\s+/g, ' ') // Normalize whitespace
  .trim()

// Must have at least some actual text content (not just structure)
if (contentOnly.length < 20) {
  fail(
    `Gate Decision section exists but lacks substantive content.\n\n` +
    `You must explicitly state:\n` +
    `- Whether a new gate was added\n` +
    `- OR why no new gate was required\n\n` +
    `Found only: "${contentOnly.slice(0, 50)}..."`
  )
}

pass(`Gate Decision section present and documented in ${filePath}`)
