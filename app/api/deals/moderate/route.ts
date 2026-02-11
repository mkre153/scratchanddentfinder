/**
 * Admin Deal Moderation API Route
 *
 * Approve or reject flagged deals.
 *
 * POST /api/deals/moderate
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { approveDeal, rejectDeal, getDealById } from '@/lib/queries'
import { getResendClient } from '@/lib/email/resend'
import { DealApprovedEmail } from '@/lib/email/templates/deal-approved'
import { DealRejectedEmail } from '@/lib/email/templates/deal-rejected'
import { SITE_URL } from '@/lib/config'
import { getDealUrl } from '@/lib/urls'

export async function POST(request: NextRequest) {
  try {
    const { isAuthorized, userId } = await requireAdmin()
    if (!isAuthorized || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dealId, action } = body as { dealId: string; action: 'approve' | 'reject' }

    if (!dealId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Missing dealId or invalid action' },
        { status: 400 }
      )
    }

    const deal = await getDealById(dealId)
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const resend = getResendClient()

    if (action === 'approve') {
      await approveDeal(dealId, userId)

      // Send approval email
      resend.emails.send({
        from: 'Scratch & Dent Finder <info@scratchanddentfinder.com>',
        to: deal.submitter_email,
        subject: 'Your deal is live!',
        html: DealApprovedEmail({
          dealTitle: deal.title,
          dealUrl: `${SITE_URL}${getDealUrl(dealId)}`,
        }),
      }).catch((err) => console.error('[Resend] Deal approved email failed:', err))

      return NextResponse.json({ success: true, action: 'approved' })
    } else {
      await rejectDeal(dealId, userId)

      // Send rejection email
      resend.emails.send({
        from: 'Scratch & Dent Finder <info@scratchanddentfinder.com>',
        to: deal.submitter_email,
        subject: 'Deal submission update',
        html: DealRejectedEmail({ dealTitle: deal.title }),
      }).catch((err) => console.error('[Resend] Deal rejected email failed:', err))

      return NextResponse.json({ success: true, action: 'rejected' })
    }
  } catch (error) {
    console.error('Deal moderation error:', error)
    return NextResponse.json(
      { error: 'Failed to moderate deal' },
      { status: 500 }
    )
  }
}
