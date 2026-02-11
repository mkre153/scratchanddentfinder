/**
 * Verify Deal Email API Route
 *
 * Validates the 6-digit code. If moderation passed, activates the deal.
 * If moderation flagged, marks email as verified but keeps in review.
 *
 * POST /api/deals/verify
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import {
  getDealById,
  activateDeal,
  verifyDealEmail,
  incrementDealVerificationAttempts,
} from '@/lib/queries'
import { getResendClient } from '@/lib/email/resend'
import { DealApprovedEmail } from '@/lib/email/templates/deal-approved'
import { SITE_URL } from '@/lib/config'
import { getDealUrl } from '@/lib/urls'

const MAX_ATTEMPTS = 5

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealId, code } = body

    if (!dealId || !code) {
      return NextResponse.json(
        { error: 'Missing dealId or code' },
        { status: 400 }
      )
    }

    const deal = await getDealById(dealId)

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Already verified
    if (deal.email_verified_at) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        status: deal.moderation_status === 'approved' ? 'live' : 'under_review',
      })
    }

    // Check expiry
    if (
      deal.verification_expires_at &&
      new Date(deal.verification_expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please resubmit your deal.' },
        { status: 400 }
      )
    }

    // Check attempts
    if (deal.verification_attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Too many attempts. Please resubmit your deal.' },
        { status: 429 }
      )
    }

    // Verify code
    const codeHash = hashCode(code.toString().trim())
    if (codeHash !== deal.verification_code_hash) {
      await incrementDealVerificationAttempts(dealId)
      const attemptsRemaining = MAX_ATTEMPTS - deal.verification_attempts - 1

      return NextResponse.json(
        {
          error: 'Invalid verification code',
          attemptsRemaining: Math.max(0, attemptsRemaining),
        },
        { status: 400 }
      )
    }

    // Code valid — handle based on moderation status
    if (deal.moderation_status === 'approved') {
      // Auto-approved: activate immediately
      await activateDeal(dealId)

      // Send "deal is live" email (non-blocking)
      const resend = getResendClient()
      resend.emails.send({
        from: 'Scratch & Dent Finder <info@scratchanddentfinder.com>',
        to: deal.submitter_email,
        subject: 'Your deal is live!',
        html: DealApprovedEmail({
          dealTitle: deal.title,
          dealUrl: `${SITE_URL}${getDealUrl(dealId)}`,
        }),
      }).catch((err) => console.error('[Resend] Deal approved email failed:', err))

      return NextResponse.json({
        success: true,
        message: 'Your deal is now live!',
        status: 'live',
      })
    } else {
      // Flagged: mark email verified, keep in review
      await verifyDealEmail(dealId)

      return NextResponse.json({
        success: true,
        message: 'Email verified! Your deal is under review and will be published within 24 hours.',
        status: 'under_review',
      })
    }
  } catch (error) {
    console.error('Deal verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
