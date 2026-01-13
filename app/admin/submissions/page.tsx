/**
 * Admin Submissions List - Slice 6: Trust Promotion
 *
 * Non-discoverable admin page:
 * - NOT in sitemap
 * - NO public links
 * - force-dynamic (no static rendering)
 *
 * Displays pending store submissions with Approve/Reject actions.
 */

export const dynamic = 'force-dynamic'

import { getPendingSubmissions, approveSubmission, rejectSubmission } from '@/lib/queries'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

async function handleApprove(formData: FormData) {
  'use server'
  const submissionId = formData.get('submissionId') as string
  if (!submissionId) return

  try {
    await approveSubmission(submissionId)
    revalidatePath('/admin/submissions/')
  } catch (error) {
    console.error('Failed to approve submission:', error)
  }
}

async function handleReject(formData: FormData) {
  'use server'
  const submissionId = formData.get('submissionId') as string
  if (!submissionId) return

  try {
    await rejectSubmission(submissionId)
    revalidatePath('/admin/submissions/')
  } catch (error) {
    console.error('Failed to reject submission:', error)
  }
}

export default async function AdminSubmissions() {
  const submissions = await getPendingSubmissions()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pending Submissions</h1>
          <Link
            href="/admin/"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No pending submissions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {submission.businessName}
                    </h2>
                    <p className="text-gray-600">
                      {submission.streetAddress}, {submission.city}, {submission.state}
                    </p>
                    {submission.phone && (
                      <p className="text-gray-600">Phone: {submission.phone}</p>
                    )}
                    {submission.website && (
                      <p className="text-gray-600">Website: {submission.website}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <form action={handleApprove}>
                      <input type="hidden" name="submissionId" value={submission.id} />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                    </form>

                    <form action={handleReject}>
                      <input type="hidden" name="submissionId" value={submission.id} />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
