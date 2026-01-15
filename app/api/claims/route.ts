/**
 * Claims API Route
 *
 * Creates store ownership claims for authenticated users.
 * Slice 10: Operator Control
 *
 * POST /api/claims
 * Body: { storeId: number, notes?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClaim, getStoreById, getExistingClaim } from '@/lib/queries'
import { createAuthClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const cookieStore = await cookies()
    const supabase = await createAuthClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const {
      storeId,
      claimerName,
      claimerEmail,
      claimerPhone,
      claimerRelationship,
      verificationNotes,
    } = body as {
      storeId: number
      claimerName?: string
      claimerEmail?: string
      claimerPhone?: string
      claimerRelationship?: string
      verificationNotes?: string
    }

    if (!storeId || typeof storeId !== 'number') {
      return NextResponse.json(
        { error: 'storeId is required and must be a number' },
        { status: 400 }
      )
    }

    // Validate required verification fields
    if (!claimerName || !claimerEmail || !claimerPhone || !claimerRelationship || !verificationNotes) {
      return NextResponse.json(
        { error: 'All verification fields are required' },
        { status: 400 }
      )
    }

    // 3. Validate store exists
    const store = await getStoreById(storeId)
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // 4. Check if store is already claimed by someone else
    if (store.claimedBy && store.claimedBy !== user.id) {
      return NextResponse.json(
        { error: 'This store has already been claimed by another user' },
        { status: 409 }
      )
    }

    // 5. Check if user already has a pending or approved claim for this store
    const existingClaim = await getExistingClaim(storeId, user.id)
    if (existingClaim) {
      if (existingClaim.status === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending claim for this store', claimId: existingClaim.id },
          { status: 409 }
        )
      }
      if (existingClaim.status === 'approved') {
        return NextResponse.json(
          { error: 'You have already claimed this store', claimId: existingClaim.id },
          { status: 409 }
        )
      }
      // If rejected, allow re-claiming
    }

    // 6. Create the claim
    const claim = await createClaim({
      store_id: storeId,
      user_id: user.id,
      claimer_name: claimerName,
      claimer_email: claimerEmail,
      claimer_phone: claimerPhone,
      claimer_relationship: claimerRelationship,
      verification_notes: verificationNotes,
    })

    // 7. Return success with claim ID
    return NextResponse.json({
      success: true,
      claimId: claim.id,
      status: claim.status,
      message: 'Claim submitted successfully. It will be reviewed by an admin.',
    })
  } catch (error) {
    console.error('Claim creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    )
  }
}
