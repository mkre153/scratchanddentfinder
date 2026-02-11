/**
 * Start Deal Submission API Route
 *
 * Creates a deal, runs moderation, sends verification email.
 *
 * POST /api/deals/start
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { validateDealForm, type DealFormData } from '@/lib/deal-submission'
import { createDeal } from '@/lib/queries'
import { moderateDeal } from '@/lib/moderation'
import { getResendClient } from '@/lib/email/resend'
import { DealVerificationCodeEmail } from '@/lib/email/templates/deal-verification-code'
import type { ApplianceType, DealCondition, DealModerationStatus } from '@/lib/types'

const BUCKET = 'deal-photos'

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

function getPhotoPublicUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const formData: DealFormData = {
      submitterName: body.submitterName || '',
      submitterEmail: body.submitterEmail || '',
      submitterPhone: body.submitterPhone || '',
      storeName: body.storeName || '',
      storeId: body.storeId || null,
      title: body.title || '',
      applianceType: body.applianceType || '',
      brand: body.brand || '',
      modelNumber: body.modelNumber || '',
      originalPrice: body.originalPrice || '',
      dealPrice: body.dealPrice || '',
      condition: body.condition || '',
      damageDescription: body.damageDescription || '',
      description: body.description || '',
      city: body.city || '',
      state: body.state || '',
      zip: body.zip || '',
      photoPaths: body.photoPaths || [],
    }

    // Validate
    const result = validateDealForm(formData)
    if (!result.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: result.errors },
        { status: 400 }
      )
    }

    // Run moderation pipeline
    const photoUrls = (formData.photoPaths || []).map(getPhotoPublicUrl)
    const moderation = await moderateDeal({
      title: formData.title,
      description: formData.description,
      damageDescription: formData.damageDescription,
      photoUrls,
    })

    const moderationStatus: DealModerationStatus = moderation.passed ? 'approved' : 'flagged'

    // Generate verification code
    const code = generateCode()
    const codeHash = hashCode(code)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    const dealExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Convert prices from dollars to cents
    const dealPriceCents = Math.round(parseFloat(formData.dealPrice) * 100)
    const originalPriceCents = formData.originalPrice
      ? Math.round(parseFloat(formData.originalPrice) * 100)
      : null

    // Create deal
    const deal = await createDeal({
      store_id: formData.storeId || null,
      submitter_email: formData.submitterEmail.trim(),
      submitter_name: formData.submitterName.trim(),
      submitter_phone: formData.submitterPhone?.trim() || null,
      verification_code_hash: codeHash,
      verification_expires_at: expiresAt.toISOString(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      appliance_type: formData.applianceType as ApplianceType,
      brand: formData.brand?.trim() || null,
      model_number: formData.modelNumber?.trim() || null,
      original_price: originalPriceCents,
      deal_price: dealPriceCents,
      damage_description: formData.damageDescription.trim(),
      condition: (formData.condition as DealCondition) || 'good',
      city: formData.city.trim(),
      state: formData.state.toUpperCase(),
      zip: formData.zip?.trim() || null,
      photo_paths: formData.photoPaths || [],
      moderation_status: moderationStatus,
      moderation_flags: moderation.flags as Record<string, unknown>,
      moderation_reviewed_by: null,
      moderation_reviewed_at: null,
      status: 'draft',
      expires_at: dealExpiresAt.toISOString(),
    })

    // Send verification email
    const resend = getResendClient()
    await resend.emails.send({
      from: 'Scratch & Dent Finder <info@scratchanddentfinder.com>',
      to: formData.submitterEmail.trim(),
      subject: `Your verification code: ${code}`,
      html: DealVerificationCodeEmail({
        code,
        dealTitle: formData.title,
      }),
    })

    return NextResponse.json({
      success: true,
      dealId: deal.id,
      email: formData.submitterEmail,
      message: `Verification code sent to ${formData.submitterEmail}`,
    })
  } catch (error) {
    console.error('Deal submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit deal' },
      { status: 500 }
    )
  }
}
