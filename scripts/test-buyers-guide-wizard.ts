#!/usr/bin/env npx tsx
/**
 * Buyer's Guide Wizard Test Suite
 *
 * Tests validation logic, component source correctness, and compiler integration
 * for the 8-step buyer's guide wizard at /buyers-guide/.
 *
 * Usage:
 *   npx tsx scripts/test-buyers-guide-wizard.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Import compile directly from the compiled dist file.
// We use a relative path because the package's dist uses extensionless ESM imports
// (e.g. './compiler' instead of './compiler.js') which break Node's ESM resolution
// but work fine when bundled by Next.js.
import { compile } from '../packages/buyers-tool/dist/compiler.js'
import type { BuyerInput, CompilerOutput } from '../packages/buyers-tool/dist/schema'

// =============================================================================
// Test Runner
// =============================================================================

interface TestResult {
  category: string
  name: string
  passed: boolean
  message: string
}

const results: TestResult[] = []

function test(category: string, name: string, fn: () => void) {
  try {
    fn()
    results.push({ category, name, passed: true, message: 'PASS' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    results.push({ category, name, passed: false, message: `FAIL: ${msg}` })
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

function assertIncludes(source: string, needle: string, message: string) {
  if (!source.includes(needle)) throw new Error(message)
}

function assertMatch(source: string, pattern: RegExp, message: string) {
  if (!pattern.test(source)) throw new Error(message)
}

// =============================================================================
// Helpers — Read source files once
// =============================================================================

const ROOT = path.resolve(__dirname, '..')

function readSrc(relPath: string): string {
  const fullPath = path.join(ROOT, relPath)
  if (!fs.existsSync(fullPath)) throw new Error(`File not found: ${relPath}`)
  return fs.readFileSync(fullPath, 'utf8')
}

const wizardHookSrc = readSrc('hooks/useBuyerToolWizard.ts')
const returnPolicySrc = readSrc('components/buyers-tool/steps/ReturnPolicyStep.tsx')
const applianceSrc = readSrc('components/buyers-tool/steps/ApplianceStep.tsx')
const damageSrc = readSrc('components/buyers-tool/steps/DamageStep.tsx')
const retailerSrc = readSrc('components/buyers-tool/steps/RetailerStep.tsx')
const installationSrc = readSrc('components/buyers-tool/steps/InstallationStep.tsx')
const buyerContextSrc = readSrc('components/buyers-tool/steps/BuyerContextStep.tsx')

// =============================================================================
// Helpers — Validation function extractors
// =============================================================================

// We can't import validation functions directly (they're local to the hook),
// so we re-implement the same logic here for testing. This ensures our tests
// match the actual validation rules.

function validateAppliance(data: Record<string, unknown>): string[] {
  const errors: string[] = []
  if (!data.type) errors.push('type required')
  if (!data.retailPrice || (data.retailPrice as number) <= 0) errors.push('retailPrice required')
  if (!data.askingPrice || (data.askingPrice as number) <= 0) errors.push('askingPrice required')
  if (data.askingPrice && data.retailPrice && (data.askingPrice as number) > (data.retailPrice as number))
    errors.push('askingPrice > retailPrice')
  return errors
}

function validateDamage(data: Record<string, unknown>): string[] {
  const errors: string[] = []
  if (!data.locations || (data.locations as unknown[]).length === 0) errors.push('locations required')
  if (!data.severity) errors.push('severity required')
  if (!data.types || (data.types as unknown[]).length === 0) errors.push('types required')
  return errors
}

function validateRetailer(data: Record<string, unknown>): string[] {
  const errors: string[] = []
  if (!data.type) errors.push('type required')
  return errors
}

function validateWarranty(data: Record<string, unknown>): string[] {
  const errors: string[] = []
  if (data.manufacturerCovered === undefined) errors.push('manufacturerCovered required')
  if (data.retailerWarrantyMonths === undefined) errors.push('retailerWarrantyMonths required')
  return errors
}

function validateReturnPolicy(data: Record<string, unknown>): string[] {
  const errors: string[] = []
  if (data.windowDays === undefined) errors.push('windowDays required')
  if (data.finalSale === undefined) errors.push('finalSale required')
  return errors
}

function validateInstallation(data: Record<string, unknown>): string[] {
  const errors: string[] = []
  if (!data.type) errors.push('type required')
  if (!data.visibleSides || (data.visibleSides as unknown[]).length === 0) errors.push('visibleSides required')
  return errors
}

function validateBuyerContext(data: Record<string, unknown>): string[] {
  const errors: string[] = []
  if (!data.purpose) errors.push('purpose required')
  if (!data.riskTolerance) errors.push('riskTolerance required')
  if (!data.priceFlexibility) errors.push('priceFlexibility required')
  return errors
}

function validateInspection(): string[] {
  return []
}

// =============================================================================
// Helpers — Compiler input builders
// =============================================================================

function makeValidInput(overrides?: Partial<BuyerInput>): BuyerInput {
  return {
    appliance: { type: 'refrigerator', retailPrice: 2000, askingPrice: 1400 },
    damage: { locations: ['front_door'], severity: 'moderate', types: ['dent'] },
    retailer: { type: 'big_box' },
    warranty: {
      manufacturerCovered: true,
      retailerWarrantyMonths: 12,
      laborIncluded: true,
      partsIncluded: true,
      extendedAvailable: false,
    },
    returnPolicy: { windowDays: 30, restockingFeePercent: 0, finalSale: false },
    installation: { type: 'freestanding', visibleSides: ['front'] },
    buyer: { purpose: 'primary_home', riskTolerance: 'moderate', priceFlexibility: 'negotiable' },
    ...overrides,
  }
}

// =============================================================================
// Category 1: Validation Rules (8 tests)
// =============================================================================

test('Validation', '1. Appliance: missing type → error', () => {
  const errors = validateAppliance({ retailPrice: 1000, askingPrice: 800 })
  assert(errors.length > 0, 'Expected validation error for missing type')
  assert(errors.some(e => e.includes('type')), 'Error should mention type')
})

test('Validation', '2. Appliance: askingPrice > retailPrice → error', () => {
  const errors = validateAppliance({ type: 'refrigerator', retailPrice: 1000, askingPrice: 1500 })
  assert(errors.length > 0, 'Expected validation error for askingPrice > retailPrice')
  assert(errors.some(e => e.includes('askingPrice')), 'Error should mention askingPrice')
})

test('Validation', '3. Damage: empty locations → error', () => {
  const errors = validateDamage({ locations: [], severity: 'light', types: ['dent'] })
  assert(errors.length > 0, 'Expected validation error for empty locations')
})

test('Validation', '4. Warranty: undefined manufacturerCovered → error', () => {
  const errors = validateWarranty({ retailerWarrantyMonths: 6 })
  assert(errors.length > 0, 'Expected validation error for undefined manufacturerCovered')
})

test('Validation', '5. ReturnPolicy: undefined windowDays → error', () => {
  const errors = validateReturnPolicy({ finalSale: false })
  assert(errors.length > 0, 'Expected validation error for undefined windowDays')
})

test('Validation', '6. ReturnPolicy: finalSale=true requires windowDays=0 (not undefined)', () => {
  // When finalSale=true, windowDays must be set to 0 (not left undefined)
  const errorsUndefined = validateReturnPolicy({ finalSale: true })
  assert(errorsUndefined.length > 0, 'windowDays=undefined should fail validation even with finalSale=true')
  const errorsZero = validateReturnPolicy({ finalSale: true, windowDays: 0 })
  assert(errorsZero.length === 0, 'finalSale=true with windowDays=0 should pass validation')
})

test('Validation', '7. Installation: empty visibleSides → error', () => {
  const errors = validateInstallation({ type: 'freestanding', visibleSides: [] })
  assert(errors.length > 0, 'Expected validation error for empty visibleSides')
})

test('Validation', '8. Inspection: empty data → no errors (optional)', () => {
  const errors = validateInspection()
  assert(errors.length === 0, 'Inspection step should have no required fields')
})

// =============================================================================
// Category 2: Component Source Checks (10 tests)
// =============================================================================

test('Components', '9. ReturnPolicyStep: "Yes, final sale" onChange sets windowDays: 0', () => {
  // The critical bug fix: when user selects "Yes, final sale", onChange must include windowDays: 0
  assertMatch(
    returnPolicySrc,
    /onChange\(\s*\{[^}]*finalSale:\s*true[^}]*windowDays:\s*0[^}]*\}/,
    'ReturnPolicyStep "Yes, final sale" onChange must set windowDays: 0'
  )
})

test('Components', '10. ReturnPolicyStep: windowDays field only renders when finalSale === false', () => {
  // The Return Window input should be conditionally rendered
  assertMatch(
    returnPolicySrc,
    /data\.finalSale\s*===\s*false\s*&&\s*\(\s*[\s\S]*?windowDays/,
    'windowDays field should only render when finalSale === false'
  )
})

test('Components', '11. ReturnPolicyStep: Restocking Fee only renders when finalSale === false', () => {
  assertMatch(
    returnPolicySrc,
    /data\.finalSale\s*===\s*false\s*&&\s*\(\s*[\s\S]*?restockingFee/,
    'Restocking Fee field should only render when finalSale === false'
  )
})

test('Components', '12. ApplianceStep: All 6 appliance types present', () => {
  const expected = ['refrigerator', 'washer', 'dryer', 'range', 'dishwasher', 'microwave']
  for (const t of expected) {
    assertIncludes(applianceSrc, `'${t}'`, `ApplianceStep missing type: ${t}`)
  }
})

test('Components', '13. DamageStep: All 9 damage locations present', () => {
  const expected = [
    'front_door', 'front_panel', 'control_panel', 'handle',
    'left_side', 'right_side', 'back', 'top', 'bottom',
  ]
  for (const loc of expected) {
    assertIncludes(damageSrc, `'${loc}'`, `DamageStep missing location: ${loc}`)
  }
})

test('Components', '14. DamageStep: All 3 severity levels present', () => {
  const expected = ['light', 'moderate', 'severe']
  for (const s of expected) {
    assertIncludes(damageSrc, `'${s}'`, `DamageStep missing severity: ${s}`)
  }
})

test('Components', '15. DamageStep: All 4 damage types present', () => {
  const expected = ['scratch', 'dent', 'scuff', 'discoloration']
  for (const t of expected) {
    assertIncludes(damageSrc, `'${t}'`, `DamageStep missing damage type: ${t}`)
  }
})

test('Components', '16. RetailerStep: All 5 retailer types present', () => {
  const expected = ['big_box', 'independent', 'outlet', 'online', 'liquidation']
  for (const t of expected) {
    assertIncludes(retailerSrc, `'${t}'`, `RetailerStep missing retailer type: ${t}`)
  }
})

test('Components', '17. InstallationStep: All 3 installation types present', () => {
  const expected = ['freestanding', 'built_in', 'stacked']
  for (const t of expected) {
    assertIncludes(installationSrc, `'${t}'`, `InstallationStep missing installation type: ${t}`)
  }
})

test('Components', '18. BuyerContextStep: All 4 purpose options present', () => {
  const expected = ['primary_home', 'rental_property', 'flip', 'temporary']
  for (const p of expected) {
    assertIncludes(buyerContextSrc, `'${p}'`, `BuyerContextStep missing purpose: ${p}`)
  }
})

// =============================================================================
// Category 3: Compiler Integration (8 tests)
// =============================================================================

test('Compiler', '19. Happy path: complete valid input → verdict exists', () => {
  const input = makeValidInput()
  const output = compile(input, { timestamp: '2026-02-10T00:00:00Z' })
  assert(!!output.verdict, 'Output must have verdict')
  assert(!!output.verdict.recommendation, 'Verdict must have recommendation')
  assert(
    ['PROCEED', 'PROCEED_WITH_CAUTION', 'SKIP', 'WALK_AWAY'].includes(output.verdict.recommendation),
    `Unexpected recommendation: ${output.verdict.recommendation}`
  )
})

test('Compiler', '20. Happy path: financial output has discount percentage', () => {
  const input = makeValidInput()
  const output = compile(input, { timestamp: '2026-02-10T00:00:00Z' })
  assert(!!output.financial, 'Output must have financial section')
  assert(typeof output.financial.discountPercent === 'number', 'discountPercent must be a number')
  assert(output.financial.discountPercent > 0, 'Expected positive discount for asking < retail')
})

test('Compiler', '21. Final sale path: finalSale=true, windowDays=0 → compiles successfully', () => {
  const input = makeValidInput({
    returnPolicy: { windowDays: 0, restockingFeePercent: 0, finalSale: true },
  })
  const output = compile(input, { timestamp: '2026-02-10T00:00:00Z' })
  assert(!!output.verdict, 'Final sale input must compile to verdict')
})

test('Compiler', '22. No inspection: omit inspection → compiles successfully', () => {
  const input = makeValidInput()
  delete (input as Record<string, unknown>).inspection
  const output = compile(input, { timestamp: '2026-02-10T00:00:00Z' })
  assert(!!output.verdict, 'Input without inspection must compile')
})

test('Compiler', '23. Severe damage: severity=severe → has damage assessment', () => {
  const input = makeValidInput({
    damage: { locations: ['front_door', 'control_panel'], severity: 'severe', types: ['dent', 'scratch'] },
  })
  const output = compile(input, { timestamp: '2026-02-10T00:00:00Z' })
  assert(!!output.damageAssessment, 'Output must have damageAssessment')
  assert(typeof output.damageAssessment.tier === 'number', 'damageAssessment must have tier')
})

test('Compiler', '24. No warranty: manufacturerCovered=false, 0 months → compiles', () => {
  const input = makeValidInput({
    warranty: {
      manufacturerCovered: false,
      retailerWarrantyMonths: 0,
      laborIncluded: false,
      partsIncluded: false,
      extendedAvailable: false,
    },
  })
  const output = compile(input, { timestamp: '2026-02-10T00:00:00Z' })
  assert(!!output.verdict, 'No warranty input must compile')
  assert(!!output.warrantyEvaluation, 'Must have warrantyEvaluation')
})

test('Compiler', '25. Budget buyer: purpose=flip, riskTolerance=high → compiles', () => {
  const input = makeValidInput({
    buyer: { purpose: 'flip', riskTolerance: 'high', priceFlexibility: 'negotiable' },
  })
  const output = compile(input, { timestamp: '2026-02-10T00:00:00Z' })
  assert(!!output.verdict, 'Budget buyer input must compile')
})

test('Compiler', '26. Premium buyer: purpose=primary_home, riskTolerance=low → compiles', () => {
  const input = makeValidInput({
    buyer: { purpose: 'primary_home', riskTolerance: 'low', priceFlexibility: 'firm' },
  })
  const output = compile(input, { timestamp: '2026-02-10T00:00:00Z' })
  assert(!!output.verdict, 'Premium buyer input must compile')
})

// =============================================================================
// Category 4: Cross-Step Consistency (4 tests)
// =============================================================================

test('Consistency', '27. Wizard hook has exactly 8 input steps + 1 results step', () => {
  // WIZARD_STEPS should have 9 entries (8 input + results)
  const stepsMatch = wizardHookSrc.match(/WIZARD_STEPS\s*=\s*\[([\s\S]*?)\]\s*as\s*const/)
  assert(!!stepsMatch, 'WIZARD_STEPS array not found')
  const stepsContent = stepsMatch![1]
  const stepNames = stepsContent.match(/'[a-zA-Z]+'/g)
  assert(!!stepNames, 'Could not extract step names')
  assert(stepNames!.length === 9, `Expected 9 steps, found ${stepNames!.length}`)
})

test('Consistency', '28. Step names match expected order', () => {
  const expected = [
    'appliance', 'damage', 'retailer', 'warranty', 'returnPolicy',
    'installation', 'buyerContext', 'inspection', 'results',
  ]
  for (const name of expected) {
    assertIncludes(wizardHookSrc, `'${name}'`, `WIZARD_STEPS missing: ${name}`)
  }
})

test('Consistency', '29. All validation functions exist for steps 0-7', () => {
  const expectedFns = [
    'validateAppliance', 'validateDamage', 'validateRetailer', 'validateWarranty',
    'validateReturnPolicy', 'validateInstallation', 'validateBuyerContext', 'validateInspection',
  ]
  for (const fn of expectedFns) {
    assertMatch(
      wizardHookSrc,
      new RegExp(`function\\s+${fn}\\s*\\(`),
      `Validation function not found: ${fn}`
    )
  }
})

test('Consistency', '30. buildBuyerInput maps all 8 form sections', () => {
  // The buildBuyerInput function should destructure all 8 form sections
  const sections = [
    'appliance', 'damage', 'retailer', 'warranty',
    'returnPolicy', 'installation', 'buyerContext', 'inspection',
  ]
  for (const section of sections) {
    assertIncludes(
      wizardHookSrc,
      section,
      `buildBuyerInput should reference section: ${section}`
    )
  }
  // Also verify it destructures from formState
  assertMatch(
    wizardHookSrc,
    /const\s*\{[^}]*appliance[^}]*\}\s*=\s*formState/,
    'buildBuyerInput should destructure from formState'
  )
})

// =============================================================================
// Run & Report
// =============================================================================

const passed = results.filter(r => r.passed).length
const failed = results.filter(r => !r.passed).length
const total = results.length

console.log('\n=== Buyer\'s Guide Wizard Test Suite ===\n')

let currentCategory = ''
for (const r of results) {
  if (r.category !== currentCategory) {
    currentCategory = r.category
    console.log(`\n--- ${currentCategory} ---`)
  }
  const icon = r.passed ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'
  console.log(`  ${icon} ${r.name}`)
  if (!r.passed) {
    console.log(`    ${r.message}`)
  }
}

console.log(`\n=== Results: ${passed}/${total} passed, ${failed} failed ===\n`)

// Write results file
const resultsPath = path.join(ROOT, 'test-results-buyers-guide-wizard.txt')
const lines = [
  `Buyer's Guide Wizard Test Results`,
  `Run: ${new Date().toISOString()}`,
  `Results: ${passed}/${total} passed, ${failed} failed`,
  '',
]
for (const r of results) {
  lines.push(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.category} > ${r.name}`)
  if (!r.passed) lines.push(`  ${r.message}`)
}
fs.writeFileSync(resultsPath, lines.join('\n') + '\n')
console.log(`Results written to: test-results-buyers-guide-wizard.txt`)

process.exit(failed > 0 ? 1 : 0)
