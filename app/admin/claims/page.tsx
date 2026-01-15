/**
 * Admin Claims List - Slice 10: Operator Control
 *
 * Non-discoverable admin page:
 * - NOT in sitemap
 * - NO public links
 * - force-dynamic (no static rendering)
 * - Role-based auth (not just obscurity)
 *
 * Displays pending store ownership claims with Approve/Reject actions.
 * Approved claims trigger database trigger to update stores.claimed_by.
 */

export const dynamic = 'force-dynamic'

import { getPendingClaimsWithStores, approveClaim, rejectClaim } from '@/lib/queries'
import { requireAdmin, getCurrentUserId } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

async function handleApprove(formData: FormData) {
  'use server'
  const claimId = formData.get('claimId') as string
  if (!claimId) return

  const userId = await getCurrentUserId()
  if (!userId) return

  try {
    await approveClaim(claimId, userId)
    revalidatePath('/admin/claims/')
  } catch (error) {
    console.error('Failed to approve claim:', error)
  }
}

async function handleReject(formData: FormData) {
  'use server'
  const claimId = formData.get('claimId') as string
  if (!claimId) return

  const userId = await getCurrentUserId()
  if (!userId) return

  try {
    await rejectClaim(claimId, userId)
    revalidatePath('/admin/claims/')
  } catch (error) {
    console.error('Failed to reject claim:', error)
  }
}

export default async function AdminClaims() {
  const { isAuthorized } = await requireAdmin()

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Authorized</h1>
          <p className="text-gray-600">You must be an admin to access this page.</p>
        </div>
      </div>
    )
  }

  const claims = await getPendingClaimsWithStores()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pending Claims</h1>
          <Link
            href="/admin/"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </Link>
        </div>

        {claims.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No pending ownership claims</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-4">
                    {/* Store Info */}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {claim.storeName}
                      </h2>
                      <p className="text-gray-600">{claim.storeAddress}</p>
                    </div>

                    {/* Claimer Verification Info */}
                    <div className="bg-blue-50 rounded-md p-4 space-y-2">
                      <h3 className="font-semibold text-blue-900">Claimer Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Name:</span>{' '}
                          <span className="text-gray-900">{claim.claimerName || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>{' '}
                          <a href={`mailto:${claim.claimerEmail}`} className="text-blue-600 hover:underline">
                            {claim.claimerEmail || 'Not provided'}
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>{' '}
                          <a href={`tel:${claim.claimerPhone}`} className="text-blue-600 hover:underline">
                            {claim.claimerPhone || 'Not provided'}
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-500">Relationship:</span>{' '}
                          <span className="text-gray-900 capitalize">{claim.claimerRelationship || 'Not provided'}</span>
                        </div>
                      </div>
                      {claim.verificationNotes && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <span className="text-gray-500 text-sm">How they can verify:</span>
                          <p className="text-gray-900 mt-1">{claim.verificationNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Claim ID: {claim.id}</p>
                      <p>User ID: {claim.userId}</p>
                      <p>Submitted: {new Date(claim.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <form action={handleApprove}>
                      <input type="hidden" name="claimId" value={claim.id} />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                    </form>

                    <form action={handleReject}>
                      <input type="hidden" name="claimId" value={claim.id} />
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
