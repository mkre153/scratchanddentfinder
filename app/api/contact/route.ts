import { NextResponse } from 'next/server'
import { createContactSubmission } from '@/lib/queries'
import type { ContactSubmissionInsert } from '@/lib/types'

const VALID_SUBJECTS = [
  'General Inquiry',
  'Business Inquiry',
  'Store Correction',
  'Feedback',
]

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, email, subject, message } = body as {
      name?: string
      email?: string
      subject?: string
      message?: string
    }

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    // Validate subject
    if (!VALID_SUBJECTS.includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject' },
        { status: 400 }
      )
    }

    const submission: ContactSubmissionInsert = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    }

    await createContactSubmission(submission)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact submission error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
