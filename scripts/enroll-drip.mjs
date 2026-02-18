#!/usr/bin/env node
/**
 * Drip Enrollment Script
 *
 * Enrolls active store emails into the 4-step outreach drip sequence.
 * Skips already-enrolled emails (unique constraint on store_email_id + step).
 *
 * Usage: node scripts/enroll-drip.mjs
 * Options:
 *   --limit N    Only enroll first N emails (for testing)
 *   --dry-run    Show what would be enrolled without inserting
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

// Drip schedule: step N is sent N*5 days after enrollment
const DRIP_STEPS = [
  { step: 1, daysAfter: 0 },
  { step: 2, daysAfter: 5 },
  { step: 3, daysAfter: 10 },
  { step: 4, daysAfter: 15 },
]

// Parse args
const args = process.argv.slice(2)
const limitIdx = args.indexOf('--limit')
const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 0
const dryRun = args.includes('--dry-run')

async function main() {
  console.log('=== Drip Enrollment ===\n')
  if (dryRun) console.log('DRY RUN — no rows will be inserted\n')

  // Get active store emails not yet enrolled
  let query = supabase
    .from('store_emails')
    .select('id')
    .is('unsubscribed_at', null)
    .eq('bounced', false)

  if (limit > 0) {
    query = query.limit(limit)
  }

  const { data: storeEmails, error } = await query

  if (error) {
    console.error('Error fetching store emails:', error)
    process.exit(1)
  }

  if (!storeEmails || storeEmails.length === 0) {
    console.log('No active store emails found.')
    return
  }

  console.log(`Active store emails: ${storeEmails.length}`)

  // Check which are already enrolled (have any drip row)
  const emailIds = storeEmails.map(e => e.id)

  // Paginate existing drip check
  const enrolledIds = new Set()
  const PAGE = 1000
  for (let i = 0; i < emailIds.length; i += PAGE) {
    const batch = emailIds.slice(i, i + PAGE)
    const { data: existing } = await supabase
      .from('outreach_drips')
      .select('store_email_id')
      .in('store_email_id', batch)

    if (existing) {
      for (const row of existing) {
        enrolledIds.add(row.store_email_id)
      }
    }
  }

  const toEnroll = storeEmails.filter(e => !enrolledIds.has(e.id))
  console.log(`Already enrolled: ${enrolledIds.size}`)
  console.log(`To enroll: ${toEnroll.length}\n`)

  if (toEnroll.length === 0) {
    console.log('Nothing to enroll. Done.')
    return
  }

  if (dryRun) {
    console.log(`Would create ${toEnroll.length * DRIP_STEPS.length} drip rows for ${toEnroll.length} emails.`)
    return
  }

  // Build all drip rows
  const now = new Date()
  const rows = []

  for (const email of toEnroll) {
    for (const { step, daysAfter } of DRIP_STEPS) {
      const scheduledFor = new Date(now)
      scheduledFor.setDate(scheduledFor.getDate() + daysAfter)
      // Set to 3 PM UTC (8 AM PST) on the scheduled day
      scheduledFor.setUTCHours(15, 0, 0, 0)

      rows.push({
        store_email_id: email.id,
        step,
        status: 'pending',
        scheduled_for: scheduledFor.toISOString(),
      })
    }
  }

  // Insert in batches of 500 (Supabase limit)
  const BATCH = 500
  let inserted = 0
  let skipped = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error: insertError, count } = await supabase
      .from('outreach_drips')
      .upsert(batch, { onConflict: 'store_email_id,step', ignoreDuplicates: true, count: 'exact' })

    if (insertError) {
      console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, insertError.message)
      skipped += batch.length
    } else {
      inserted += count || batch.length
    }
  }

  console.log(`=== Enrollment Complete ===`)
  console.log(`Inserted: ${inserted} drip rows`)
  console.log(`Skipped/errors: ${skipped}`)
  console.log(`Emails enrolled: ${toEnroll.length}`)
  console.log(`Steps per email: ${DRIP_STEPS.length}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
