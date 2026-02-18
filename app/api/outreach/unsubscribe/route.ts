/**
 * Outreach Unsubscribe Route
 *
 * GET /api/outreach/unsubscribe?id=<store_email_id>&email=<email>&token=<hmac>
 *
 * Validates HMAC token and sets unsubscribed_at on the store_emails row.
 * Renders a simple confirmation page.
 */

import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const idStr = searchParams.get('id')
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  if (!idStr || !email || !token) {
    return new NextResponse(
      htmlPage(
        'Invalid Request',
        'Missing parameters. Please use the unsubscribe link from your email.'
      ),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  const storeEmailId = parseInt(idStr, 10)
  if (isNaN(storeEmailId)) {
    return new NextResponse(
      htmlPage('Invalid Request', 'Invalid store email ID.'),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  // Validate HMAC token
  const secret = process.env.NEWSLETTER_API_KEY || ''
  const expectedToken = createHmac('sha256', secret)
    .update(`outreach:${storeEmailId}:${email}`)
    .digest('hex')

  let valid = false
  try {
    valid = timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    )
  } catch {
    valid = false
  }

  if (!valid) {
    return new NextResponse(
      htmlPage(
        'Invalid Link',
        'This unsubscribe link is invalid or has expired. Please contact us if you need help.'
      ),
      { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  // Set unsubscribed_at
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from('store_emails')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('id', storeEmailId)
    .eq('email', email.toLowerCase())

  if (error) {
    console.error('Outreach unsubscribe error:', error)
    return new NextResponse(
      htmlPage(
        'Something Went Wrong',
        'We could not process your request. Please try again later.'
      ),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  return new NextResponse(
    htmlPage(
      "You've Been Unsubscribed",
      "You will no longer receive outreach emails from Scratch &amp; Dent Finder about the deals marketplace. Your store listing remains active."
    ),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} - Scratch &amp; Dent Finder</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f1f5f9;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .card {
      background: #ffffff;
      border-radius: 8px;
      padding: 48px 32px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1e293b;
      font-size: 24px;
      margin: 0 0 16px 0;
    }
    p {
      color: #475569;
      font-size: 16px;
      line-height: 24px;
      margin: 0 0 24px 0;
    }
    a.btn {
      display: inline-block;
      background-color: #6b8f71;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      font-size: 14px;
    }
    a.btn:hover { background-color: #5a7d60; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <a class="btn" href="https://scratchanddentfinder.com/">Back to Scratch &amp; Dent Finder</a>
  </div>
</body>
</html>`
}
