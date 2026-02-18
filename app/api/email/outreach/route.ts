/**
 * Outreach Drip Send API Route
 *
 * GET /api/email/outreach
 *
 * Processes pending drip emails scheduled for today or earlier.
 * Auth: Bearer token via CRON_SECRET (Vercel cron) or NEWSLETTER_API_KEY (manual).
 * Sends via Resend batch API, up to 100 per batch.
 * After sending step 1, syncs contact to CRM with marketplace-outreach tag.
 */

import { NextResponse } from 'next/server'
import { createHmac } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { renderDripHtml, getDripSubject } from '@/lib/email/templates/outreach-drip'
import { upsertContact } from '@shared/crm'

function getOutreachUnsubscribeUrl(storeEmailId: number, email: string): string {
  const token = createHmac('sha256', process.env.NEWSLETTER_API_KEY || '')
    .update(`outreach:${storeEmailId}:${email}`)
    .digest('hex')
  return `https://scratchanddentfinder.com/api/outreach/unsubscribe?id=${storeEmailId}&email=${encodeURIComponent(email)}&token=${token}`
}

/**
 * GET handler for Vercel cron trigger.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return processOutreachDrips()
}

/**
 * POST handler for manual trigger.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expectedKey = process.env.NEWSLETTER_API_KEY
  if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return processOutreachDrips()
}

async function processOutreachDrips() {
  try {
    // Fetch pending drips scheduled for now or earlier
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: drips, error: dripError } = await (supabaseAdmin as any)
      .from('outreach_drips')
      .select(`
        id,
        store_email_id,
        step,
        store_emails!inner (
          id,
          store_id,
          email,
          unsubscribed_at,
          bounced
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(500)

    if (dripError) {
      console.error('Error fetching drips:', dripError)
      return NextResponse.json({ error: 'Failed to fetch drips' }, { status: 500 })
    }

    if (!drips || drips.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No pending drips' })
    }

    // Filter out unsubscribed or bounced
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeDrips = drips.filter((d: any) => {
      const se = d.store_emails
      return !se.unsubscribed_at && !se.bounced
    })

    if (activeDrips.length === 0) {
      return NextResponse.json({ sent: 0, skipped: drips.length, message: 'All drips filtered (unsubscribed/bounced)' })
    }

    // Fetch store details for all unique store_ids
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storeIds = Array.from(new Set(activeDrips.map((d: any) => d.store_emails.store_id)))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: stores, error: storeError } = await (supabaseAdmin as any)
      .from('stores')
      .select('id, name, city_id, state_id, cities!inner(name), states!inner(name)')
      .in('id', storeIds)

    if (storeError) {
      console.error('Error fetching stores:', storeError)
      return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storeMap: Map<number, any> = new Map(stores.map((s: any) => [s.id, s]))

    // Build Resend emails
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emails: any[] = []
    const dripIds: number[] = []
    const step1Contacts: { email: string; storeName: string; city: string; state: string }[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const drip of activeDrips as any[]) {
      const store = storeMap.get(drip.store_emails.store_id)
      if (!store) continue

      const storeName = store.name || 'Your Store'
      const storeCity = store.cities?.name || ''
      const storeState = store.states?.name || ''
      const email = drip.store_emails.email

      const unsubscribeUrl = getOutreachUnsubscribeUrl(drip.store_emails.id, email)

      const html = renderDripHtml({
        step: drip.step,
        storeName,
        storeCity,
        storeState,
        unsubscribeUrl,
      })

      const subject = getDripSubject(drip.step, storeName)

      emails.push({
        from: 'Scratch & Dent Finder <hello@scratchanddentfinder.com>',
        to: email,
        subject,
        html,
      })
      dripIds.push(drip.id)

      // Track step 1 sends for CRM sync
      if (drip.step === 1) {
        step1Contacts.push({ email, storeName, city: storeCity, state: storeState })
      }
    }

    // Send via Resend batch API
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    const BATCH_SIZE = 100
    let totalSent = 0
    const errors: string[] = []
    const sentDripIds: number[] = []

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)
      const batchDripIds = dripIds.slice(i, i + BATCH_SIZE)

      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      })

      if (!res.ok) {
        const errBody = await res.text()
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${res.status} - ${errBody}`)
      } else {
        totalSent += batch.length
        sentDripIds.push(...batchDripIds)
      }
    }

    // Mark sent drips
    if (sentDripIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin as any)
        .from('outreach_drips')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .in('id', sentDripIds)
    }

    // Mark failed drips
    const failedIds = dripIds.filter(id => !sentDripIds.includes(id))
    if (failedIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin as any)
        .from('outreach_drips')
        .update({ status: 'failed' })
        .in('id', failedIds)
    }

    // CRM sync for step 1 contacts (fire-and-forget)
    for (const contact of step1Contacts) {
      upsertContact({
        email: contact.email,
        firstName: contact.storeName,
        sourceSite: 'sdf',
        sourceForm: 'marketplace-outreach',
        tags: ['marketplace-outreach', 'drip-step-1'],
        consent: true,
        metadata: {
          business_name: contact.storeName,
          city: contact.city,
          state: contact.state,
        },
      }).catch(err => console.error('[CRM] Step 1 sync error:', err))
    }

    return NextResponse.json({
      sent: totalSent,
      total: emails.length,
      skipped: drips.length - activeDrips.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Outreach drip error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
