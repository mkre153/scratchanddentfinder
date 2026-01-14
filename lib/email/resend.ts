/**
 * Resend Email Client
 *
 * Singleton client for sending transactional emails via Resend.
 */

import { Resend } from 'resend'

// Singleton instance
let resendClient: Resend | null = null

export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}
