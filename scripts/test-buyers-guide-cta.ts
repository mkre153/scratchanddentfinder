#!/usr/bin/env npx tsx
/**
 * Buyer's Guide CTA Button Test Suite
 *
 * Comprehensive tests for the Buyer's Guide CTA button implementation
 * across Header.tsx (desktop) and MobileMenu.tsx (mobile).
 *
 * Usage:
 *   npx tsx scripts/test-buyers-guide-cta.ts
 *
 * Tests:
 *   1. URL Generation - getBlogUrl() returns correct path
 *   2. Header Component - Desktop CTA presence and attributes
 *   3. MobileMenu Component - Mobile CTA presence and attributes
 *   4. Styling Consistency - Brand colors and touch targets
 *   5. Link Integrity - Correct href and import statements
 *   6. Accessibility - Minimum touch targets (44px)
 *   7. Visual Hierarchy - Buyer's Guide before Add Your Store
 *   8. Import Validation - getBlogUrl imported in both components
 */

import * as fs from 'fs'
import * as path from 'path'

// =============================================================================
// Types
// =============================================================================

interface TestResult {
  testId: number
  name: string
  category: string
  passed: boolean
  message: string
  details?: string[]
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  passRate: string
  duration: string
  timestamp: string
  results: TestResult[]
}

// =============================================================================
// Test Configuration
// =============================================================================

const PROJECT_ROOT = path.resolve(__dirname, '..')
const HEADER_PATH = path.join(PROJECT_ROOT, 'components/layout/Header.tsx')
const MOBILE_MENU_PATH = path.join(PROJECT_ROOT, 'components/layout/MobileMenu.tsx')
const URLS_PATH = path.join(PROJECT_ROOT, 'lib/urls.ts')

const EXPECTED_BUYERS_GUIDE_URL = '/buyers-guide/'
const SAGE_BG_CLASS = 'bg-sage-600'
const SAGE_HOVER_CLASS = 'hover:bg-sage-700'
const YELLOW_BG_CLASS = 'bg-yellow-400'
const MIN_TOUCH_TARGET = 'min-h-[44px]'

// =============================================================================
// Utility Functions
// =============================================================================

function readFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf8')
}

function extractLinkBlocks(content: string): string[] {
  // Extract all <Link ... >...</Link> blocks
  const linkRegex = /<Link[\s\S]*?<\/Link>/g
  return content.match(linkRegex) || []
}

function findBuyersGuideCTA(content: string): string | null {
  const links = extractLinkBlocks(content)
  for (const link of links) {
    if (link.includes("Buyer's Guide") || link.includes('Buyer\'s Guide')) {
      return link
    }
  }
  return null
}

function findAddStoreCTA(content: string): string | null {
  const links = extractLinkBlocks(content)
  for (const link of links) {
    if (link.includes('+ Add Your Store') || link.includes('Add Your Store')) {
      return link
    }
  }
  return null
}

// =============================================================================
// Test Cases
// =============================================================================

const tests: Array<() => TestResult> = []
let testIdCounter = 0

// -----------------------------------------------------------------------------
// Category 1: URL Generation
// -----------------------------------------------------------------------------

tests.push(() => {
  const testId = ++testIdCounter
  const name = 'getBuyersGuideUrl() function exists'
  const category = 'URL Generation'

  try {
    const content = readFile(URLS_PATH)
    const hasFn = content.includes('export function getBuyersGuideUrl()')

    return {
      testId,
      name,
      category,
      passed: hasFn,
      message: hasFn
        ? 'PASS: getBuyersGuideUrl() function is exported from lib/urls.ts'
        : 'FAIL: getBuyersGuideUrl() function not found in lib/urls.ts',
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error reading urls.ts - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = 'getBuyersGuideUrl() returns /buyers-guide/'
  const category = 'URL Generation'

  try {
    const content = readFile(URLS_PATH)
    const fnMatch = content.match(/export function getBuyersGuideUrl\(\)[^{]*\{([^}]+)\}/)

    if (!fnMatch) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: 'FAIL: Could not parse getBuyersGuideUrl() function body',
      }
    }

    const fnBody = fnMatch[1]
    const returnsCorrectUrl = fnBody.includes("'/buyers-guide/'") || fnBody.includes('"/buyers-guide/"')

    return {
      testId,
      name,
      category,
      passed: returnsCorrectUrl,
      message: returnsCorrectUrl
        ? `PASS: getBuyersGuideUrl() returns '${EXPECTED_BUYERS_GUIDE_URL}'`
        : `FAIL: getBuyersGuideUrl() does not return '${EXPECTED_BUYERS_GUIDE_URL}'`,
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing getBuyersGuideUrl() - ${error}`,
    }
  }
})

// -----------------------------------------------------------------------------
// Category 2: Header Component (Desktop)
// -----------------------------------------------------------------------------

tests.push(() => {
  const testId = ++testIdCounter
  const name = 'Header.tsx imports getBuyersGuideUrl'
  const category = 'Header Component'

  try {
    const content = readFile(HEADER_PATH)
    const hasImport = content.includes('getBuyersGuideUrl')

    return {
      testId,
      name,
      category,
      passed: hasImport,
      message: hasImport
        ? 'PASS: Header.tsx imports getBuyersGuideUrl from lib/urls'
        : 'FAIL: Header.tsx does not import getBuyersGuideUrl',
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error reading Header.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = "Header.tsx contains Buyer's Guide CTA"
  const category = 'Header Component'

  try {
    const content = readFile(HEADER_PATH)
    const buyersGuideCTA = findBuyersGuideCTA(content)

    return {
      testId,
      name,
      category,
      passed: !!buyersGuideCTA,
      message: buyersGuideCTA
        ? "PASS: Header.tsx contains Buyer's Guide CTA button"
        : "FAIL: Header.tsx missing Buyer's Guide CTA button",
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error reading Header.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = "Header Buyer's Guide links to getBuyersGuideUrl()"
  const category = 'Header Component'

  try {
    const content = readFile(HEADER_PATH)
    const buyersGuideCTA = findBuyersGuideCTA(content)

    if (!buyersGuideCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: "FAIL: Buyer's Guide CTA not found in Header.tsx",
      }
    }

    const usesGetBuyersGuideUrl = buyersGuideCTA.includes('getBuyersGuideUrl()')

    return {
      testId,
      name,
      category,
      passed: usesGetBuyersGuideUrl,
      message: usesGetBuyersGuideUrl
        ? "PASS: Header Buyer's Guide CTA uses getBuyersGuideUrl()"
        : "FAIL: Header Buyer's Guide CTA does not use getBuyersGuideUrl()",
      details: [buyersGuideCTA.substring(0, 200) + '...'],
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing Header.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = "Header Buyer's Guide uses sage color"
  const category = 'Header Component'

  try {
    const content = readFile(HEADER_PATH)
    const buyersGuideCTA = findBuyersGuideCTA(content)

    if (!buyersGuideCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: "FAIL: Buyer's Guide CTA not found in Header.tsx",
      }
    }

    const hasSageBg = buyersGuideCTA.includes(SAGE_BG_CLASS)
    const hasSageHover = buyersGuideCTA.includes(SAGE_HOVER_CLASS)
    const hasWhiteText = buyersGuideCTA.includes('text-white')

    const allCorrect = hasSageBg && hasSageHover && hasWhiteText

    return {
      testId,
      name,
      category,
      passed: allCorrect,
      message: allCorrect
        ? `PASS: Header Buyer's Guide uses ${SAGE_BG_CLASS}, ${SAGE_HOVER_CLASS}, text-white`
        : 'FAIL: Header Buyer\'s Guide has incorrect styling',
      details: [
        `bg-sage-600: ${hasSageBg ? 'YES' : 'NO'}`,
        `hover:bg-sage-700: ${hasSageHover ? 'YES' : 'NO'}`,
        `text-white: ${hasWhiteText ? 'YES' : 'NO'}`,
      ],
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing Header.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = "Header Buyer's Guide has 44px touch target"
  const category = 'Header Component'

  try {
    const content = readFile(HEADER_PATH)
    const buyersGuideCTA = findBuyersGuideCTA(content)

    if (!buyersGuideCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: "FAIL: Buyer's Guide CTA not found in Header.tsx",
      }
    }

    const hasTouchTarget = buyersGuideCTA.includes(MIN_TOUCH_TARGET)

    return {
      testId,
      name,
      category,
      passed: hasTouchTarget,
      message: hasTouchTarget
        ? `PASS: Header Buyer's Guide has ${MIN_TOUCH_TARGET} for accessibility`
        : `FAIL: Header Buyer's Guide missing ${MIN_TOUCH_TARGET} touch target`,
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing Header.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = "Header Buyer's Guide hidden on small screens"
  const category = 'Header Component'

  try {
    const content = readFile(HEADER_PATH)
    const buyersGuideCTA = findBuyersGuideCTA(content)

    if (!buyersGuideCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: "FAIL: Buyer's Guide CTA not found in Header.tsx",
      }
    }

    const hasResponsiveClass =
      buyersGuideCTA.includes('hidden sm:inline-flex') ||
      buyersGuideCTA.includes('hidden md:inline-flex')

    return {
      testId,
      name,
      category,
      passed: hasResponsiveClass,
      message: hasResponsiveClass
        ? "PASS: Header Buyer's Guide is hidden on small mobile screens"
        : "FAIL: Header Buyer's Guide should be hidden on small screens (use mobile menu instead)",
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing Header.tsx - ${error}`,
    }
  }
})

// -----------------------------------------------------------------------------
// Category 3: MobileMenu Component
// -----------------------------------------------------------------------------

tests.push(() => {
  const testId = ++testIdCounter
  const name = 'MobileMenu.tsx imports getBuyersGuideUrl'
  const category = 'MobileMenu Component'

  try {
    const content = readFile(MOBILE_MENU_PATH)
    const hasImport = content.includes('getBuyersGuideUrl')

    return {
      testId,
      name,
      category,
      passed: hasImport,
      message: hasImport
        ? 'PASS: MobileMenu.tsx imports getBuyersGuideUrl from lib/urls'
        : 'FAIL: MobileMenu.tsx does not import getBuyersGuideUrl',
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error reading MobileMenu.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = "MobileMenu.tsx contains Buyer's Guide CTA"
  const category = 'MobileMenu Component'

  try {
    const content = readFile(MOBILE_MENU_PATH)
    const buyersGuideCTA = findBuyersGuideCTA(content)

    return {
      testId,
      name,
      category,
      passed: !!buyersGuideCTA,
      message: buyersGuideCTA
        ? "PASS: MobileMenu.tsx contains Buyer's Guide CTA button"
        : "FAIL: MobileMenu.tsx missing Buyer's Guide CTA button",
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error reading MobileMenu.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = "MobileMenu Buyer's Guide links to getBuyersGuideUrl()"
  const category = 'MobileMenu Component'

  try {
    const content = readFile(MOBILE_MENU_PATH)
    const buyersGuideCTA = findBuyersGuideCTA(content)

    if (!buyersGuideCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: "FAIL: Buyer's Guide CTA not found in MobileMenu.tsx",
      }
    }

    const usesGetBuyersGuideUrl = buyersGuideCTA.includes('getBuyersGuideUrl()')

    return {
      testId,
      name,
      category,
      passed: usesGetBuyersGuideUrl,
      message: usesGetBuyersGuideUrl
        ? "PASS: MobileMenu Buyer's Guide CTA uses getBuyersGuideUrl()"
        : "FAIL: MobileMenu Buyer's Guide CTA does not use getBuyersGuideUrl()",
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing MobileMenu.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = "MobileMenu Buyer's Guide uses sage color"
  const category = 'MobileMenu Component'

  try {
    const content = readFile(MOBILE_MENU_PATH)
    const buyersGuideCTA = findBuyersGuideCTA(content)

    if (!buyersGuideCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: "FAIL: Buyer's Guide CTA not found in MobileMenu.tsx",
      }
    }

    const hasSageBg = buyersGuideCTA.includes(SAGE_BG_CLASS)
    const hasSageHover = buyersGuideCTA.includes(SAGE_HOVER_CLASS)
    const hasWhiteText = buyersGuideCTA.includes('text-white')

    const allCorrect = hasSageBg && hasSageHover && hasWhiteText

    return {
      testId,
      name,
      category,
      passed: allCorrect,
      message: allCorrect
        ? `PASS: MobileMenu Buyer's Guide uses ${SAGE_BG_CLASS}, ${SAGE_HOVER_CLASS}, text-white`
        : 'FAIL: MobileMenu Buyer\'s Guide has incorrect styling',
      details: [
        `bg-sage-600: ${hasSageBg ? 'YES' : 'NO'}`,
        `hover:bg-sage-700: ${hasSageHover ? 'YES' : 'NO'}`,
        `text-white: ${hasWhiteText ? 'YES' : 'NO'}`,
      ],
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing MobileMenu.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = "MobileMenu Buyer's Guide has 44px touch target"
  const category = 'MobileMenu Component'

  try {
    const content = readFile(MOBILE_MENU_PATH)
    const buyersGuideCTA = findBuyersGuideCTA(content)

    if (!buyersGuideCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: "FAIL: Buyer's Guide CTA not found in MobileMenu.tsx",
      }
    }

    const hasTouchTarget = buyersGuideCTA.includes(MIN_TOUCH_TARGET)

    return {
      testId,
      name,
      category,
      passed: hasTouchTarget,
      message: hasTouchTarget
        ? `PASS: MobileMenu Buyer's Guide has ${MIN_TOUCH_TARGET} for accessibility`
        : `FAIL: MobileMenu Buyer's Guide missing ${MIN_TOUCH_TARGET} touch target`,
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing MobileMenu.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = "MobileMenu Buyer's Guide calls onClose"
  const category = 'MobileMenu Component'

  try {
    const content = readFile(MOBILE_MENU_PATH)
    const buyersGuideCTA = findBuyersGuideCTA(content)

    if (!buyersGuideCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: "FAIL: Buyer's Guide CTA not found in MobileMenu.tsx",
      }
    }

    const hasOnClick = buyersGuideCTA.includes('onClick={onClose}')

    return {
      testId,
      name,
      category,
      passed: hasOnClick,
      message: hasOnClick
        ? "PASS: MobileMenu Buyer's Guide calls onClose to dismiss menu"
        : "FAIL: MobileMenu Buyer's Guide should call onClose on click",
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing MobileMenu.tsx - ${error}`,
    }
  }
})

// -----------------------------------------------------------------------------
// Category 4: Visual Hierarchy
// -----------------------------------------------------------------------------

tests.push(() => {
  const testId = ++testIdCounter
  const name = "Buyer's Guide appears before Add Your Store (Header)"
  const category = 'Visual Hierarchy'

  try {
    const content = readFile(HEADER_PATH)
    const buyersGuidePos = content.indexOf("Buyer's Guide")
    const addStorePos = content.indexOf('+ Add Your Store')

    if (buyersGuidePos === -1 || addStorePos === -1) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: 'FAIL: Could not find both CTA buttons in Header.tsx',
      }
    }

    const correctOrder = buyersGuidePos < addStorePos

    return {
      testId,
      name,
      category,
      passed: correctOrder,
      message: correctOrder
        ? "PASS: Buyer's Guide appears before Add Your Store in Header"
        : "FAIL: Buyer's Guide should appear before Add Your Store",
      details: [
        `Buyer's Guide position: ${buyersGuidePos}`,
        `Add Your Store position: ${addStorePos}`,
      ],
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing Header.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = "Buyer's Guide appears before Add Your Store (MobileMenu)"
  const category = 'Visual Hierarchy'

  try {
    const content = readFile(MOBILE_MENU_PATH)
    const buyersGuidePos = content.indexOf("Buyer's Guide")
    const addStorePos = content.indexOf('+ Add Your Store')

    if (buyersGuidePos === -1 || addStorePos === -1) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: 'FAIL: Could not find both CTA buttons in MobileMenu.tsx',
      }
    }

    const correctOrder = buyersGuidePos < addStorePos

    return {
      testId,
      name,
      category,
      passed: correctOrder,
      message: correctOrder
        ? "PASS: Buyer's Guide appears before Add Your Store in MobileMenu"
        : "FAIL: Buyer's Guide should appear before Add Your Store",
      details: [
        `Buyer's Guide position: ${buyersGuidePos}`,
        `Add Your Store position: ${addStorePos}`,
      ],
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing MobileMenu.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = 'Add Your Store retains yellow color (Header)'
  const category = 'Visual Hierarchy'

  try {
    const content = readFile(HEADER_PATH)
    const addStoreCTA = findAddStoreCTA(content)

    if (!addStoreCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: 'FAIL: Add Your Store CTA not found in Header.tsx',
      }
    }

    const hasYellowBg = addStoreCTA.includes(YELLOW_BG_CLASS)

    return {
      testId,
      name,
      category,
      passed: hasYellowBg,
      message: hasYellowBg
        ? `PASS: Add Your Store retains ${YELLOW_BG_CLASS} as primary CTA`
        : `FAIL: Add Your Store should use ${YELLOW_BG_CLASS}`,
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing Header.tsx - ${error}`,
    }
  }
})

tests.push(() => {
  const testId = ++testIdCounter
  const name = 'Add Your Store retains yellow color (MobileMenu)'
  const category = 'Visual Hierarchy'

  try {
    const content = readFile(MOBILE_MENU_PATH)
    const addStoreCTA = findAddStoreCTA(content)

    if (!addStoreCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: 'FAIL: Add Your Store CTA not found in MobileMenu.tsx',
      }
    }

    const hasYellowBg = addStoreCTA.includes(YELLOW_BG_CLASS)

    return {
      testId,
      name,
      category,
      passed: hasYellowBg,
      message: hasYellowBg
        ? `PASS: Add Your Store retains ${YELLOW_BG_CLASS} as primary CTA`
        : `FAIL: Add Your Store should use ${YELLOW_BG_CLASS}`,
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error parsing MobileMenu.tsx - ${error}`,
    }
  }
})

// -----------------------------------------------------------------------------
// Category 5: Color Contrast (Distinct CTAs)
// -----------------------------------------------------------------------------

tests.push(() => {
  const testId = ++testIdCounter
  const name = "Buyer's Guide and Add Your Store have different colors"
  const category = 'Color Contrast'

  try {
    const headerContent = readFile(HEADER_PATH)
    const buyersGuideCTA = findBuyersGuideCTA(headerContent)
    const addStoreCTA = findAddStoreCTA(headerContent)

    if (!buyersGuideCTA || !addStoreCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: 'FAIL: Could not find both CTA buttons',
      }
    }

    const buyersHasSage = buyersGuideCTA.includes(SAGE_BG_CLASS)
    const addStoreHasYellow = addStoreCTA.includes(YELLOW_BG_CLASS)
    const distinctColors = buyersHasSage && addStoreHasYellow

    return {
      testId,
      name,
      category,
      passed: distinctColors,
      message: distinctColors
        ? 'PASS: CTAs have distinct colors (sage vs yellow) for visual differentiation'
        : 'FAIL: CTAs should have distinct colors for visual hierarchy',
      details: [
        `Buyer's Guide: ${buyersHasSage ? SAGE_BG_CLASS : 'MISSING'}`,
        `Add Your Store: ${addStoreHasYellow ? YELLOW_BG_CLASS : 'MISSING'}`,
      ],
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error checking color contrast - ${error}`,
    }
  }
})

// -----------------------------------------------------------------------------
// Category 6: Spacing (MobileMenu)
// -----------------------------------------------------------------------------

tests.push(() => {
  const testId = ++testIdCounter
  const name = 'MobileMenu CTA buttons have proper spacing'
  const category = 'Mobile Spacing'

  try {
    const content = readFile(MOBILE_MENU_PATH)
    const addStoreCTA = findAddStoreCTA(content)

    if (!addStoreCTA) {
      return {
        testId,
        name,
        category,
        passed: false,
        message: 'FAIL: Add Your Store CTA not found in MobileMenu.tsx',
      }
    }

    const hasMarginTop = addStoreCTA.includes('mt-3') || addStoreCTA.includes('mt-4')

    return {
      testId,
      name,
      category,
      passed: hasMarginTop,
      message: hasMarginTop
        ? 'PASS: MobileMenu CTA buttons have margin spacing between them'
        : 'FAIL: MobileMenu Add Your Store should have mt-3 or mt-4 for spacing',
    }
  } catch (error) {
    return {
      testId,
      name,
      category,
      passed: false,
      message: `FAIL: Error checking spacing - ${error}`,
    }
  }
})

// =============================================================================
// Test Runner
// =============================================================================

function runTests(): TestSummary {
  const startTime = Date.now()
  const results: TestResult[] = []

  console.log('\n' + '='.repeat(70))
  console.log("BUYER'S GUIDE CTA BUTTON - TEST SUITE")
  console.log('='.repeat(70) + '\n')

  for (const test of tests) {
    const result = test()
    results.push(result)

    const status = result.passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'
    console.log(`[${status}] ${result.testId}. ${result.name}`)
    console.log(`   Category: ${result.category}`)
    console.log(`   ${result.message}`)
    if (result.details) {
      result.details.forEach((d) => console.log(`     - ${d}`))
    }
    console.log()
  }

  const endTime = Date.now()
  const duration = `${endTime - startTime}ms`
  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const passRate = ((passed / results.length) * 100).toFixed(1) + '%'

  const summary: TestSummary = {
    total: results.length,
    passed,
    failed,
    passRate,
    duration,
    timestamp: new Date().toISOString(),
    results,
  }

  // Print summary
  console.log('='.repeat(70))
  console.log('SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total Tests: ${summary.total}`)
  console.log(`Passed:      ${summary.passed} \x1b[32m\u2713\x1b[0m`)
  console.log(`Failed:      ${summary.failed} ${summary.failed > 0 ? '\x1b[31m\u2717\x1b[0m' : ''}`)
  console.log(`Pass Rate:   ${summary.passRate}`)
  console.log(`Duration:    ${summary.duration}`)
  console.log(`Timestamp:   ${summary.timestamp}`)
  console.log('='.repeat(70) + '\n')

  return summary
}

// =============================================================================
// Report Generation
// =============================================================================

function generateReport(summary: TestSummary): string {
  const categorySummary: Record<string, { passed: number; failed: number }> = {}

  for (const result of summary.results) {
    if (!categorySummary[result.category]) {
      categorySummary[result.category] = { passed: 0, failed: 0 }
    }
    if (result.passed) {
      categorySummary[result.category].passed++
    } else {
      categorySummary[result.category].failed++
    }
  }

  let report = `
BUYER'S GUIDE CTA BUTTON - TEST REPORT
======================================

Test Run: ${summary.timestamp}
Duration: ${summary.duration}

OVERALL RESULTS
---------------
Total Tests: ${summary.total}
Passed:      ${summary.passed}
Failed:      ${summary.failed}
Pass Rate:   ${summary.passRate}

RESULTS BY CATEGORY
-------------------
`

  for (const [category, stats] of Object.entries(categorySummary)) {
    const total = stats.passed + stats.failed
    const rate = ((stats.passed / total) * 100).toFixed(0)
    report += `${category}: ${stats.passed}/${total} (${rate}%)\n`
  }

  report += `
DETAILED RESULTS
----------------
`

  for (const result of summary.results) {
    const status = result.passed ? 'PASS' : 'FAIL'
    report += `\n[${status}] Test ${result.testId}: ${result.name}\n`
    report += `Category: ${result.category}\n`
    report += `${result.message}\n`
    if (result.details) {
      result.details.forEach((d) => (report += `  - ${d}\n`))
    }
  }

  report += `
=== END OF REPORT ===
`

  return report
}

// =============================================================================
// Main Execution
// =============================================================================

const summary = runTests()
const report = generateReport(summary)

// Write report to file
const reportPath = path.join(PROJECT_ROOT, 'test-results-buyers-guide-cta.txt')
fs.writeFileSync(reportPath, report)
console.log(`Report written to: ${reportPath}`)

// Exit with error code if any tests failed
if (summary.failed > 0) {
  process.exit(1)
}
