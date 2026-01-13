#!/usr/bin/env npx tsx
/**
 * Seed States Script
 *
 * Slice 0 (Backfill): Seeds all 50 US states into the database.
 * Idempotent - skips states that already exist.
 * Static data only - no external API calls.
 */

import { supabaseAdmin } from '../lib/supabase/admin'

interface StateData {
  slug: string
  name: string
  emoji: string
  gradient_color: string
}

/**
 * All 50 US states with emojis and gradient colors.
 * Static, deterministic data.
 */
const US_STATES: StateData[] = [
  { slug: 'alabama', name: 'Alabama', emoji: '🏈', gradient_color: 'red' },
  { slug: 'alaska', name: 'Alaska', emoji: '🏔️', gradient_color: 'blue' },
  { slug: 'arizona', name: 'Arizona', emoji: '🌵', gradient_color: 'orange' },
  { slug: 'arkansas', name: 'Arkansas', emoji: '💎', gradient_color: 'red' },
  { slug: 'california', name: 'California', emoji: '🌴', gradient_color: 'yellow' },
  { slug: 'colorado', name: 'Colorado', emoji: '⛰️', gradient_color: 'blue' },
  { slug: 'connecticut', name: 'Connecticut', emoji: '🍂', gradient_color: 'blue' },
  { slug: 'delaware', name: 'Delaware', emoji: '🏛️', gradient_color: 'blue' },
  { slug: 'florida', name: 'Florida', emoji: '🌴', gradient_color: 'teal' },
  { slug: 'georgia', name: 'Georgia', emoji: '🍑', gradient_color: 'red' },
  { slug: 'hawaii', name: 'Hawaii', emoji: '🌺', gradient_color: 'teal' },
  { slug: 'idaho', name: 'Idaho', emoji: '🥔', gradient_color: 'blue' },
  { slug: 'illinois', name: 'Illinois', emoji: '🌽', gradient_color: 'blue' },
  { slug: 'indiana', name: 'Indiana', emoji: '🏎️', gradient_color: 'red' },
  { slug: 'iowa', name: 'Iowa', emoji: '🌾', gradient_color: 'yellow' },
  { slug: 'kansas', name: 'Kansas', emoji: '🌻', gradient_color: 'yellow' },
  { slug: 'kentucky', name: 'Kentucky', emoji: '🐴', gradient_color: 'blue' },
  { slug: 'louisiana', name: 'Louisiana', emoji: '⚜️', gradient_color: 'purple' },
  { slug: 'maine', name: 'Maine', emoji: '🦞', gradient_color: 'blue' },
  { slug: 'maryland', name: 'Maryland', emoji: '🦀', gradient_color: 'red' },
  { slug: 'massachusetts', name: 'Massachusetts', emoji: '🏛️', gradient_color: 'blue' },
  { slug: 'michigan', name: 'Michigan', emoji: '🚗', gradient_color: 'blue' },
  { slug: 'minnesota', name: 'Minnesota', emoji: '❄️', gradient_color: 'blue' },
  { slug: 'mississippi', name: 'Mississippi', emoji: '🎸', gradient_color: 'blue' },
  { slug: 'missouri', name: 'Missouri', emoji: '⛩️', gradient_color: 'red' },
  { slug: 'montana', name: 'Montana', emoji: '🦌', gradient_color: 'blue' },
  { slug: 'nebraska', name: 'Nebraska', emoji: '🌽', gradient_color: 'red' },
  { slug: 'nevada', name: 'Nevada', emoji: '🎰', gradient_color: 'purple' },
  { slug: 'new-hampshire', name: 'New Hampshire', emoji: '🏔️', gradient_color: 'blue' },
  { slug: 'new-jersey', name: 'New Jersey', emoji: '🏖️', gradient_color: 'blue' },
  { slug: 'new-mexico', name: 'New Mexico', emoji: '🌶️', gradient_color: 'red' },
  { slug: 'new-york', name: 'New York', emoji: '🗽', gradient_color: 'blue' },
  { slug: 'north-carolina', name: 'North Carolina', emoji: '🏀', gradient_color: 'blue' },
  { slug: 'north-dakota', name: 'North Dakota', emoji: '🦬', gradient_color: 'blue' },
  { slug: 'ohio', name: 'Ohio', emoji: '🏈', gradient_color: 'red' },
  { slug: 'oklahoma', name: 'Oklahoma', emoji: '🤠', gradient_color: 'orange' },
  { slug: 'oregon', name: 'Oregon', emoji: '🌲', gradient_color: 'green' },
  { slug: 'pennsylvania', name: 'Pennsylvania', emoji: '🔔', gradient_color: 'blue' },
  { slug: 'rhode-island', name: 'Rhode Island', emoji: '⛵', gradient_color: 'blue' },
  { slug: 'south-carolina', name: 'South Carolina', emoji: '🌙', gradient_color: 'blue' },
  { slug: 'south-dakota', name: 'South Dakota', emoji: '🗿', gradient_color: 'blue' },
  { slug: 'tennessee', name: 'Tennessee', emoji: '🎵', gradient_color: 'orange' },
  { slug: 'texas', name: 'Texas', emoji: '🤠', gradient_color: 'red' },
  { slug: 'utah', name: 'Utah', emoji: '🏜️', gradient_color: 'red' },
  { slug: 'vermont', name: 'Vermont', emoji: '🍁', gradient_color: 'green' },
  { slug: 'virginia', name: 'Virginia', emoji: '🏛️', gradient_color: 'blue' },
  { slug: 'washington', name: 'Washington', emoji: '🌲', gradient_color: 'green' },
  { slug: 'west-virginia', name: 'West Virginia', emoji: '⛰️', gradient_color: 'blue' },
  { slug: 'wisconsin', name: 'Wisconsin', emoji: '🧀', gradient_color: 'red' },
  { slug: 'wyoming', name: 'Wyoming', emoji: '🦬', gradient_color: 'blue' },
]

async function seedStates(): Promise<void> {
  console.log('Seeding 50 US states...')
  console.log()

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const state of US_STATES) {
    // Check if state already exists
    const { data: existing } = await supabaseAdmin
      .from('states')
      .select('id')
      .eq('slug', state.slug)
      .single()

    if (existing) {
      console.log(`  SKIP: ${state.name} (already exists)`)
      skipped++
      continue
    }

    // Insert new state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
      .from('states')
      .insert(state)

    if (error) {
      console.error(`  ERROR: ${state.name} - ${error.message}`)
      errors++
    } else {
      console.log(`  INSERT: ${state.name}`)
      inserted++
    }
  }

  console.log()
  console.log('═'.repeat(40))
  console.log(`  Inserted: ${inserted}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)
  console.log('═'.repeat(40))

  if (errors > 0) {
    process.exit(1)
  }
}

seedStates().catch((err) => {
  console.error('Seed states failed:', err)
  process.exit(1)
})
