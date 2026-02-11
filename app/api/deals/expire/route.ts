/**
 * Deal Expiry Cron API Route
 *
 * Auto-expires deals older than 30 days.
 * Called by Vercel cron.
 *
 * GET /api/deals/expire
 */

import { NextRequest, NextResponse } from 'next/server'
import { expireDeals } from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sets this header)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expiredCount = await expireDeals()

    return NextResponse.json({
      success: true,
      expired: expiredCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Deal expiry cron error:', error)
    return NextResponse.json(
      { error: 'Failed to expire deals' },
      { status: 500 }
    )
  }
}
