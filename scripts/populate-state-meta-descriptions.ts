/**
 * Populate unique meta descriptions for all state pages.
 *
 * Usage:
 *   npx tsx scripts/populate-state-meta-descriptions.ts           # write to DB
 *   npx tsx scripts/populate-state-meta-descriptions.ts --dry-run  # print only
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.production' })
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const dryRun = process.argv.includes('--dry-run')

// ---------------------------------------------------------------------------
// Description templates — rotated to avoid repetition
// ---------------------------------------------------------------------------

type TemplateArgs = { name: string; storeCount: number; cityCount: number }

const templates: Array<(a: TemplateArgs) => string> = [
  ({ name, storeCount }) =>
    `Browse ${storeCount} scratch and dent appliance stores across ${name}. Save 30-70% on refrigerators, washers, dryers, and more.`,
  ({ name, storeCount, cityCount }) =>
    `${name} has ${storeCount} discount appliance stores in ${cityCount} cities. Find scratch and dent deals near you and keep more money in your pocket.`,
  ({ name, storeCount }) =>
    `Shop ${storeCount} scratch and dent stores in ${name} for brand-name appliances at deep discounts. Quality units, minor cosmetic flaws.`,
  ({ name, storeCount, cityCount }) =>
    `Discover ${storeCount} appliance outlets in ${cityCount} ${name} cities. Scratch and dent savings of 30-70% on top brands.`,
  ({ name, storeCount }) =>
    `Looking for affordable appliances in ${name}? Compare ${storeCount} scratch and dent stores for deals on fridges, ranges, and dishwashers.`,
  ({ name, storeCount, cityCount }) =>
    `Find great prices on scratch and dent appliances at ${storeCount} stores across ${cityCount} cities in ${name}.`,
  ({ name, storeCount }) =>
    `${name} shoppers: explore ${storeCount} scratch and dent appliance dealers. Save big on washers, dryers, refrigerators, and stoves.`,
  ({ name, storeCount, cityCount }) =>
    `Compare ${storeCount} scratch and dent appliance stores in ${cityCount} ${name} cities. Huge savings on brand-new units with minor dents.`,
  ({ name, storeCount }) =>
    `Score major savings in ${name} — ${storeCount} stores offer scratch and dent appliances at 30-70% below retail.`,
  ({ name, storeCount, cityCount }) =>
    `${name} has ${storeCount} appliance stores with scratch and dent inventory across ${cityCount} cities. Find local deals today.`,
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!dryRun && (!supabaseUrl || !supabaseServiceKey)) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.')
    process.exit(1)
  }

  const supabase = dryRun
    ? null
    : createClient(supabaseUrl, supabaseServiceKey)

  // Fetch states — in dry-run mode without DB access, generate sample data
  let states: Array<{ id: number; name: string; store_count: number; city_count: number }>

  if (supabase) {
    const { data, error } = await supabase
      .from('states')
      .select('id, name, store_count, city_count')
      .order('name', { ascending: true })

    if (error) {
      console.error('Failed to fetch states:', error.message)
      process.exit(1)
    }
    states = data ?? []
  } else {
    // Dry-run without DB: use placeholder data for 50 states
    const stateNames = [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
      'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
      'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
      'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
      'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
      'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
      'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
    ]
    states = stateNames.map((name, i) => ({
      id: i + 1,
      name,
      store_count: Math.floor(Math.random() * 50) + 5,
      city_count: Math.floor(Math.random() * 20) + 3,
    }))
  }

  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Generating meta descriptions for ${states.length} states\n`)

  let ok = 0
  let tooLong = 0

  for (let i = 0; i < states.length; i++) {
    const state = states[i]
    const templateFn = templates[i % templates.length]
    const desc = templateFn({
      name: state.name,
      storeCount: state.store_count,
      cityCount: state.city_count,
    })

    if (desc.length > 160) {
      tooLong++
      console.warn(`  ⚠ ${state.name}: ${desc.length} chars (over 160) — "${desc}"`)
    } else {
      ok++
      console.log(`  ✓ ${state.name} (${desc.length} chars): "${desc}"`)
    }

    if (!dryRun && supabase) {
      const { error } = await supabase
        .from('states')
        .update({ meta_description: desc })
        .eq('id', state.id)

      if (error) {
        console.error(`  ✗ Failed to update ${state.name}:`, error.message)
      }
    }
  }

  console.log(`\nDone. ${ok} OK, ${tooLong} over 160 chars.`)
  if (dryRun) {
    console.log('(No database writes — dry run mode)')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
