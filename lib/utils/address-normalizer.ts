/**
 * Address Normalization Utilities
 *
 * Deterministic address normalization for deduplication.
 * Creates consistent hashes from varied address formats.
 */

import { createHash } from 'crypto'

/**
 * Normalize an address string for consistent comparison
 *
 * Transformations:
 * - Lowercase
 * - Remove punctuation
 * - Strip ZIP codes (including doubled patterns like "02903 02903")
 * - Extract and PRESERVE 2-letter state code (appended at end)
 * - Strip full state names (converted to 2-letter code)
 * - Normalize street suffixes (Street → st, Avenue → av, etc.)
 * - Normalize directional prefixes (North → n, South → s, etc.)
 * - Remove unit/suite numbers
 * - Collapse whitespace
 *
 * This ensures the same physical address produces the same hash
 * regardless of ZIP/state formatting variations, while PREVENTING
 * cross-state collisions (same street/city in different states).
 */
export function normalizeAddress(address: string): string {
  if (!address) return ''

  // State name → 2-letter code mapping
  const stateNameToCode: Record<string, string> = {
    alabama: 'al',
    alaska: 'ak',
    arizona: 'az',
    arkansas: 'ar',
    california: 'ca',
    colorado: 'co',
    connecticut: 'ct',
    delaware: 'de',
    florida: 'fl',
    georgia: 'ga',
    hawaii: 'hi',
    idaho: 'id',
    illinois: 'il',
    indiana: 'in',
    iowa: 'ia',
    kansas: 'ks',
    kentucky: 'ky',
    louisiana: 'la',
    maine: 'me',
    maryland: 'md',
    massachusetts: 'ma',
    michigan: 'mi',
    minnesota: 'mn',
    mississippi: 'ms',
    missouri: 'mo',
    montana: 'mt',
    nebraska: 'ne',
    nevada: 'nv',
    'new hampshire': 'nh',
    'new jersey': 'nj',
    'new mexico': 'nm',
    'new york': 'ny',
    'north carolina': 'nc',
    'north dakota': 'nd',
    ohio: 'oh',
    oklahoma: 'ok',
    oregon: 'or',
    pennsylvania: 'pa',
    'rhode island': 'ri',
    'south carolina': 'sc',
    'south dakota': 'sd',
    tennessee: 'tn',
    texas: 'tx',
    utah: 'ut',
    vermont: 'vt',
    virginia: 'va',
    washington: 'wa',
    'west virginia': 'wv',
    wisconsin: 'wi',
    wyoming: 'wy',
    'district of columbia': 'dc',
  }

  // Valid 2-letter state codes
  const stateCodes = new Set([
    'al',
    'ak',
    'az',
    'ar',
    'ca',
    'co',
    'ct',
    'de',
    'dc',
    'fl',
    'ga',
    'hi',
    'id',
    'il',
    'in',
    'ia',
    'ks',
    'ky',
    'la',
    'me',
    'md',
    'ma',
    'mi',
    'mn',
    'ms',
    'mo',
    'mt',
    'ne',
    'nv',
    'nh',
    'nj',
    'nm',
    'ny',
    'nc',
    'nd',
    'oh',
    'ok',
    'or',
    'pa',
    'ri',
    'sc',
    'sd',
    'tn',
    'tx',
    'ut',
    'vt',
    'va',
    'wa',
    'wv',
    'wi',
    'wy',
  ])

  let normalized = address.toLowerCase()

  // STEP 1: Extract state code BEFORE any stripping
  // This is critical to prevent cross-state collisions
  let extractedStateCode: string | null = null

  // Try to find 2-letter state code at end (before ZIP if present)
  // Pattern: "city, ST 12345" or "city, ST" or "city ST"
  const stateCodeMatch = normalized.match(
    /[,\s]+(al|ak|az|ar|ca|co|ct|de|dc|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy)(?:\s+\d{5})?(?:[-\s]*\d{4})?\s*$/i
  )
  if (stateCodeMatch) {
    extractedStateCode = stateCodeMatch[1].toLowerCase()
  }

  // If no 2-letter code found, try full state names at END of address only
  // This prevents matching "Pennsylvania" in "Pennsylvania Avenue"
  if (!extractedStateCode) {
    // Look for state names followed by optional ZIP at the end
    const stateNamePattern =
      /,\s*(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new\s+hampshire|new\s+jersey|new\s+mexico|new\s+york|north\s+carolina|north\s+dakota|ohio|oklahoma|oregon|pennsylvania|rhode\s+island|south\s+carolina|south\s+dakota|tennessee|texas|utah|vermont|virginia|washington|west\s+virginia|wisconsin|wyoming|district\s+of\s+columbia)(?:,?\s*\d{5})?(?:[-\s]*\d{4})?\s*$/i
    const fullNameMatch = normalized.match(stateNamePattern)
    if (fullNameMatch) {
      const matchedState = fullNameMatch[1].toLowerCase().replace(/\s+/g, ' ')
      extractedStateCode = stateNameToCode[matchedState] || null
    }
  }

  // STEP 2: Now perform the normalization
  normalized = normalized
    .replace(/[^\w\s]/g, ' ') // Remove punctuation

    // Strip doubled ZIP codes first (e.g., "02903 02903" → "")
    // Only at end of address to avoid stripping street numbers
    .replace(/\b(\d{5})\s+\1\s*$/g, '')

    // Strip ZIP codes at end of address only (5-digit with optional +4)
    // This avoids stripping 5-digit street numbers like "19201 W Warren Ave"
    .replace(/\s+\d{5}(?:[-\s]*\d{4})?\s*$/g, '')

    // Strip full state names only when they appear AFTER punctuation (state position)
    // This prevents stripping "Pennsylvania" from "Pennsylvania Avenue"
    .replace(
      /(\s)(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new\s+hampshire|new\s+jersey|new\s+mexico|new\s+york|north\s+carolina|north\s+dakota|ohio|oklahoma|oregon|pennsylvania|rhode\s+island|south\s+carolina|south\s+dakota|tennessee|texas|utah|vermont|virginia|washington|west\s+virginia|wisconsin|wyoming|district\s+of\s+columbia)\s*$/gi,
      ''
    )

    // Strip 2-letter state codes (we already extracted the code)
    // Only remove if they appear to be state codes (at end or before ZIP position)
    .replace(/\b(al|ak|az|ar|ca|co|ct|de|dc|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy)\s*$/g, '')

    // Street suffixes
    .replace(/\b(street|str)\b/g, 'st')
    .replace(/\b(avenue|ave)\b/g, 'av')
    .replace(/\b(boulevard|blvd)\b/g, 'bl')
    .replace(/\b(highway|hwy)\b/g, 'hw')
    .replace(/\bfreeway\b/g, 'fwy')
    .replace(/\b(drive|dr)\b/g, 'dr')
    .replace(/\b(road|rd)\b/g, 'rd')
    .replace(/\b(lane|ln)\b/g, 'ln')
    .replace(/\b(court|ct)\b/g, 'ct')
    .replace(/\b(circle|cir)\b/g, 'cir')
    .replace(/\b(place|pl)\b/g, 'pl')
    .replace(/\b(terrace|ter)\b/g, 'ter')
    .replace(/\b(parkway|pkwy)\b/g, 'pkwy')
    .replace(/\b(way)\b/g, 'wy')

    // Directional prefixes/suffixes
    .replace(/\bnorth\b/g, 'n')
    .replace(/\bsouth\b/g, 's')
    .replace(/\beast\b/g, 'e')
    .replace(/\bwest\b/g, 'w')
    .replace(/\bnortheast\b/g, 'ne')
    .replace(/\bnorthwest\b/g, 'nw')
    .replace(/\bsoutheast\b/g, 'se')
    .replace(/\bsouthwest\b/g, 'sw')

    // Remove unit/suite designations (these vary and cause false negatives)
    .replace(/\b(suite|ste|unit|apt|apartment|#|bldg|building|floor|fl)\s*\w*\b/g, '')

    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()

  // STEP 3: Append state code at end (critical for cross-state uniqueness)
  if (extractedStateCode && stateCodes.has(extractedStateCode)) {
    normalized = `${normalized} ${extractedStateCode}`
  }

  return normalized
}

/**
 * Create a hash of a normalized address
 *
 * Uses first 16 chars of SHA256 for reasonable uniqueness
 * while keeping the column size manageable.
 */
export function hashAddress(address: string): string {
  const normalized = normalizeAddress(address)
  if (!normalized) return ''

  return createHash('sha256').update(normalized).digest('hex').slice(0, 16)
}

/**
 * Normalize a phone number to E.164 format
 *
 * Handles US phone numbers:
 * - 10 digits → +1XXXXXXXXXX
 * - 11 digits starting with 1 → +1XXXXXXXXXX
 *
 * Returns null if phone can't be normalized (international, invalid length)
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null

  const digits = phone.replace(/\D/g, '')

  // US 10-digit
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // US 11-digit with leading 1
  if (digits.length === 11 && digits[0] === '1') {
    return `+${digits}`
  }

  // Can't normalize - might be international or invalid
  return null
}

/**
 * Normalize a business name for fuzzy matching
 *
 * Used for soft-match duplicate detection (not hard constraints).
 */
export function normalizeBusinessName(name: string): string {
  if (!name) return ''

  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\b(llc|inc|corp|corporation|company|co)\b/g, '') // Remove business suffixes
    .replace(/\b(the|a|an)\b/g, '') // Remove articles
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract US ZIP code from an address string
 *
 * Handles formats:
 * - 5-digit ZIP: "Phoenix, AZ 85017"
 * - ZIP+4: "Phoenix, AZ 85017-1234"
 * - With or without state: "123 Main St, 85017"
 *
 * Returns null if no valid ZIP found.
 *
 * @example
 * extractZipFromAddress("2983 W Fairmount Ave, Phoenix, Arizona, 85017") // "85017"
 * extractZipFromAddress("3434 W Greenway Rd Suite 114, Phoenix, Arizona") // null
 */
export function extractZipFromAddress(address: string | null | undefined): string | null {
  if (!address) return null

  // Match 5-digit ZIP, optionally with +4 extension
  // Look for it at the end of the string or followed by common suffixes
  // US ZIP codes: 00501 (NY) to 99950 (AK)
  const zipPattern = /\b(\d{5})(?:-\d{4})?\s*(?:,?\s*(?:USA?|United States)?)?$/i

  const match = address.match(zipPattern)
  if (match) {
    const zip = match[1]
    // Basic validation: US ZIPs are 00501-99950
    const zipNum = parseInt(zip, 10)
    if (zipNum >= 501 && zipNum <= 99950) {
      return zip
    }
  }

  return null
}
