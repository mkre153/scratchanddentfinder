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
 * - Normalize street suffixes (Street → st, Avenue → av, etc.)
 * - Normalize directional prefixes (North → n, South → s, etc.)
 * - Remove unit/suite numbers
 * - Collapse whitespace
 */
export function normalizeAddress(address: string): string {
  if (!address) return ''

  return address
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation

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
