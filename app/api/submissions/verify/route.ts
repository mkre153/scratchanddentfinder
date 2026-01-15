/**
 * Verify Store Submission API Route
 *
 * Validates the 6-digit code and marks the submission as verified.
 * Slice 4: Untrusted Inbound
 *
 * POST /api/submissions/verify
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import {
  getSubmissionById,
  verifySubmission,
  incrementVerificationAttempts,
} from '@/lib/queries'
import { updateSubmissionVerified } from '@/lib/ghl'

const MAX_ATTEMPTS = 5

// Hash the code for comparison
function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionId, code } = body

    if (!submissionId || !code) {
      return NextResponse.json(
        { error: 'Missing submissionId or code' },
        { status: 400 }
      )
    }

    // Get the submission
    const submission = await getSubmissionById(submissionId)

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (submission.email_verified_at) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
      })
    }

    // Check if code has expired
    if (
      submission.verification_expires_at &&
      new Date(submission.verification_expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      )
    }

    // Check attempt limit
    if (submission.verification_attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new code.' },
        { status: 429 }
      )
    }

    // Verify the code
    const codeHash = hashCode(code.toString().trim())

    if (codeHash !== submission.verification_code_hash) {
      // Increment attempts
      await incrementVerificationAttempts(submissionId)
      const attemptsRemaining = MAX_ATTEMPTS - submission.verification_attempts - 1

      return NextResponse.json(
        {
          error: 'Invalid verification code',
          attemptsRemaining: Math.max(0, attemptsRemaining),
        },
        { status: 400 }
      )
    }

    // Code is valid - mark as verified
    await verifySubmission(submissionId)

    // Phase 2: Update GHL contact tags (non-blocking)
    // Removes pending-verification/unverified, adds verified/ready-for-review
    if (submission.email) {
      updateSubmissionVerified(submission.email)
        .catch((err) => console.error('[GHL] Verification update failed:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified! Your submission is now under review.',
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
