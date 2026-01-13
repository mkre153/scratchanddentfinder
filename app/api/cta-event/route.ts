/**
 * CTA Event API Route
 *
 * Slice 10: Operator Control - Event Persistence
 * Slice 11: Hardening - Durable Rate Limiting
 *
 * Receives CTA events from client-side tracker and persists to cta_events table.
 * Rate limited via Postgres RPC (durable, survives deploys/scaling).
 *
 * This is an internal API route - no authentication required for event tracking.
 * Events are fire-and-forget from the client perspective.
 */

import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import {
  insertCtaEvent,
  checkCtaRateLimit,
  checkStoreHourlyRateLimit,
  storeExists,
} from '@/lib/queries'
import type { CtaEventInsert } from '@/lib/types'

/**
 * Hash IP address for privacy-preserving rate limiting
 */
function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').substring(0, 32)
}

/**
 * Extract client IP from request headers
 */
function getClientIP(request: Request): string {
  // Vercel/Cloudflare headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return 'unknown'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const { storeId, eventType, sourcePage } = body as {
      storeId?: number
      eventType?: string
      sourcePage?: string
    }

    if (!storeId || !eventType || !sourcePage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate event type
    if (!['call', 'directions', 'website'].includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    // Validate store exists
    const exists = await storeExists(storeId)
    if (!exists) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Rate limit check (durable, Postgres-based)
    const clientIP = getClientIP(request)
    const ipHash = hashIP(clientIP)

    // Per-IP rate limit: 60 events per minute
    const ipAllowed = await checkCtaRateLimit(ipHash, storeId, 1, 60)
    if (!ipAllowed) {
      return NextResponse.json(
        { error: 'Rate limited' },
        { status: 429 }
      )
    }

    // Per-store rate limit: 1000 events per hour (anti-abuse)
    const storeAllowed = await checkStoreHourlyRateLimit(storeId, 1000)
    if (!storeAllowed) {
      return NextResponse.json(
        { error: 'Store rate limited' },
        { status: 429 }
      )
    }

    const event: CtaEventInsert = {
      store_id: storeId,
      event_type: eventType as 'call' | 'directions' | 'website',
      source_page: sourcePage,
    }

    await insertCtaEvent(event)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('CTA event insert error:', error)
    // Return success anyway - event tracking should not block user experience
    return NextResponse.json({ success: true })
  }
}
