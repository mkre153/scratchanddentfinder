/**
 * Store Submissions API Route
 *
 * Handles store submission creation from the public form.
 * Slice 4: Untrusted Inbound
 *
 * POST /api/submissions
 * Body: { businessName, streetAddress, city, state, phone?, website? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createStoreSubmission } from '@/lib/queries'
import { validateSubmission, type SubmissionFormData } from '@/lib/store-submission'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const formData: SubmissionFormData = {
      businessName: body.businessName || '',
      streetAddress: body.streetAddress || '',
      city: body.city || '',
      state: body.state || '',
      phone: body.phone || '',
      website: body.website || '',
    }

    // Validate the submission
    const result = validateSubmission(formData)

    if (!result.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: result.errors },
        { status: 400 }
      )
    }

    // Create the submission
    const submission = await createStoreSubmission(result.data!)

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Submission received. It will be reviewed by an admin.',
    })
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
