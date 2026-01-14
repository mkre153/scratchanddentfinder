/**
 * Welcome Email API Route
 *
 * Sends a welcome email to new users after signup.
 * Called from the client after successful authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getResendClient } from '@/lib/email/resend'
import { WelcomeEmail } from '@/lib/email/templates/welcome'

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if this is a new user (created within last 5 minutes)
    const createdAt = new Date(user.created_at)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    if (createdAt < fiveMinutesAgo) {
      // Not a new user, skip sending
      return NextResponse.json({ message: 'Not a new user, skipped' })
    }

    // Send welcome email
    const resend = getResendClient()

    const { error } = await resend.emails.send({
      from: 'Scratch & Dent Finder <info@scratchanddentfinder.com>',
      to: user.email,
      subject: 'Welcome to Scratch & Dent Finder! 🏠',
      react: WelcomeEmail({ userEmail: user.email }),
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Welcome email sent' })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
