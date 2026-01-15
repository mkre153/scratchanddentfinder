/**
 * Start Store Submission API Route
 *
 * Creates a pending submission and sends a 6-digit verification code.
 * Slice 4: Untrusted Inbound
 *
 * POST /api/submissions/start
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { validateSubmission, type SubmissionFormData } from '@/lib/store-submission'
import { createPendingSubmission } from '@/lib/queries'
import { getResendClient } from '@/lib/email/resend'
import { VerificationCodeEmail } from '@/lib/email/templates/verification-code'

// Generate a random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Hash the code for storage
function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Build form data
    const formData: SubmissionFormData = {
      businessName: body.businessName || '',
      streetAddress: body.streetAddress || '',
      city: body.city || '',
      state: body.state || '',
      zipcode: body.zipcode || '',
      phone: body.phone || '',
      email: body.email || '',
      website: body.website || '',
      googlePlaceId: body.googlePlaceId || '',
    }

    // Validate
    const result = validateSubmission(formData)

    if (!result.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: result.errors },
        { status: 400 }
      )
    }

    // Generate verification code
    const code = generateCode()
    const codeHash = hashCode(code)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create pending submission with verification data
    const submission = await createPendingSubmission({
      ...result.data!,
      verification_code_hash: codeHash,
      verification_expires_at: expiresAt.toISOString(),
    })

    // Send verification email
    const resend = getResendClient()
    await resend.emails.send({
      from: 'Scratch & Dent Finder <info@scratchanddentfinder.com>',
      to: formData.email,
      subject: `Your verification code: ${code}`,
      html: VerificationCodeEmail({
        code,
        businessName: formData.businessName,
      }),
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      email: formData.email,
      message: `Verification code sent to ${formData.email}`,
    })
  } catch (error) {
    console.error('Submission start error:', error)
    return NextResponse.json(
      { error: 'Failed to start submission' },
      { status: 500 }
    )
  }
}
