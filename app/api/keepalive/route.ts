/**
 * Supabase Keepalive Cron
 *
 * Prevents Supabase free-tier project from auto-pausing due to inactivity.
 * Runs a cheap count query (head: true) daily via Vercel cron.
 *
 * GET /api/keepalive
 */

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from('stores')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, timestamp: new Date().toISOString() },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      count,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err), timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}
