import { NextResponse } from 'next/server'
import { createContactSubmission } from '@/lib/queries'
import type { ContactSubmissionInsert } from '@/lib/types'
import { upsertContact, logActivity } from '@shared/crm'

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

    // Sync to CRM (non-blocking)
    upsertContact({
      email: email.trim().toLowerCase(),
      firstName: name.trim(),
      sourceSite: 'sdf',
      sourceForm: 'contact',
      tags: ['contact-form', subject.toLowerCase().replace(/\s+/g, '-')],
      consent: true,
    }).then(result => {
      if (result.success) {
        logActivity({
          contactId: result.data.id,
          type: 'form_submit',
          channel: 'web',
          subject: `Contact form: ${subject}`,
          body: message.trim(),
        }).catch(err => console.error('[CRM] Activity log failed:', err))
      }
    }).catch(err => console.error('[CRM] Contact sync failed:', err))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact submission error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
