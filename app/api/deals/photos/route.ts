/**
 * Deal Photo Upload API Route
 *
 * Generates signed upload URLs for Supabase Storage.
 * Client uploads photos directly to storage using the signed URL.
 *
 * POST /api/deals/photos
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

const MAX_PHOTOS = 4
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const BUCKET = 'deal-photos'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealId, files } = body as {
      dealId: string
      files: Array<{ name: string; type: string; size: number }>
    }

    if (!dealId) {
      return NextResponse.json({ error: 'dealId is required' }, { status: 400 })
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'No files specified' }, { status: 400 })
    }

    if (files.length > MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} photos allowed` },
        { status: 400 }
      )
    }

    // Validate each file
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP` },
          { status: 400 }
        )
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum 5MB` },
          { status: 400 }
        )
      }
    }

    // Generate signed upload URLs
    const uploadUrls = await Promise.all(
      files.map(async (file) => {
        const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
        const path = `${dealId}/${randomUUID()}.${ext}`

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabaseAdmin.storage as any)
          .from(BUCKET)
          .createSignedUploadUrl(path)

        if (error) throw error

        return {
          path,
          signedUrl: data.signedUrl,
          token: data.token,
        }
      })
    )

    return NextResponse.json({ uploadUrls })
  } catch (error) {
    console.error('Photo upload URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URLs' },
      { status: 500 }
    )
  }
}
