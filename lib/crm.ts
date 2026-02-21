/**
 * MK153CRM Ingest Client — Scratch & Dent Finder
 *
 * Sends lead data to MK153CRM via HMAC-SHA256 signed ingest API.
 * Env vars: MK153CRM_INGEST_URL, MK153CRM_INGEST_SECRET
 */

import { createHmac } from 'crypto'

const ingestUrl = process.env.MK153CRM_INGEST_URL
const ingestSecret = process.env.MK153CRM_INGEST_SECRET

export async function syncLeadToCrm(
  email: string,
  source: string,
  opts?: { tags?: string[]; metadata?: Record<string, unknown> }
) {
  if (!ingestUrl || !ingestSecret) return

  const normalizedEmail = email.toLowerCase().trim()
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const body = JSON.stringify({
    site_id: 'sdf',
    event_type: 'lead_signup',
    idempotency_key: `sdf:${normalizedEmail}:${source}`,
    lead: {
      email: normalizedEmail,
      source_form: source,
      tags: opts?.tags ?? [],
      metadata: opts?.metadata ?? {},
    },
    meta: {},
  })

  const signature = createHmac('sha256', ingestSecret)
    .update(`${timestamp}.${body}`)
    .digest('hex')

  await fetch(ingestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-MK153-Site': 'sdf',
      'X-MK153-Timestamp': timestamp,
      'X-MK153-Signature': signature,
    },
    body,
  })
}
