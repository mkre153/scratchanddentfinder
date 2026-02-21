import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { syncLeadToCrm } from '@/lib/crm'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { email, source } = body as {
      email?: string
      source?: string
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
      .from('email_subscribers')
      .insert({
        email: email.trim().toLowerCase(),
        source: source?.trim() || null,
      })

    if (error) {
      // Unique constraint violation = already subscribed
      if (error.code === '23505') {
        return NextResponse.json({ success: true, alreadySubscribed: true })
      }
      throw error
    }

    // Sync to CRM (non-blocking)
    try {
      await syncLeadToCrm(email.trim().toLowerCase(), 'newsletter', {
        tags: ['newsletter'],
      })
    } catch {}

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
