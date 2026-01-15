/**
 * Formatting utilities for display values
 */

/**
 * Formats a phone number string into (XXX) XXX-XXXX format
 * Handles 10-digit numbers and 11-digit numbers starting with 1
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  // Return as-is if not a standard format
  return phone
}
