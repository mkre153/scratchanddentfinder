/**
 * Newsletter Send API Route
 *
 * POST /api/email/newsletter
 *
 * Sends the weekly newsletter to all email subscribers.
 * Auth: Bearer token via NEWSLETTER_API_KEY env var.
 * Fetches latest blog posts from Velite, subscribers from Supabase,
 * and sends via Resend batch API.
 */

import { NextResponse } from 'next/server'
import { createHmac } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { renderNewsletterHtml } from '@/lib/email/templates/newsletter'

function getUnsubscribeUrl(email: string): string {
  const token = createHmac('sha256', process.env.NEWSLETTER_API_KEY || '')
    .update(email)
    .digest('hex')
  return `https://scratchanddentfinder.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

export async function POST(request: Request) {
  try {
    // --- Auth ---
    const authHeader = request.headers.get('authorization')
    const expectedKey = process.env.NEWSLETTER_API_KEY
    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // --- Fetch subscribers ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscribers, error: subError } = await (supabaseAdmin as any)
      .from('email_subscribers')
      .select('email')

    if (subError) {
      console.error('Failed to fetch subscribers:', subError)
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No subscribers found' })
    }

    // --- Fetch latest blog posts ---
    const { posts } = await import('../../../../.velite/index.js')
    const latestPosts = [...posts]
      .filter((p: { draft?: boolean }) => !p.draft)
      .sort(
        (a: { date: string }, b: { date: string }) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5)
      .map((p: { title: string; description: string; slug: string }) => ({
        title: p.title,
        description: p.description,
        slug: p.slug,
      }))

    // --- Build emails for Resend batch API ---
    const emails = subscribers.map(
      (sub: { email: string }) => {
        const unsubscribeUrl = getUnsubscribeUrl(sub.email)
        const html = renderNewsletterHtml(latestPosts, unsubscribeUrl)
        return {
          from: 'Scratch & Dent Finder <newsletter@scratchanddentfinder.com>',
          to: sub.email,
          subject: `New Savings Tips from Scratch & Dent Finder`,
          html,
        }
      }
    )

    // --- Send via Resend batch API ---
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Resend batch API accepts up to 100 emails per request
    const BATCH_SIZE = 100
    let totalSent = 0
    const errors: string[] = []

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)
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
      }
    }

    return NextResponse.json({
      sent: totalSent,
      total: emails.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
