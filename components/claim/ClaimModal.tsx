'use client'

/**
 * Claim Modal
 *
 * Modal form for collecting verification information when claiming a store.
 * Slice 10: Operator Control
 */

import { useState } from 'react'
import { getClaimsApiUrl, getSignInUrl } from '@/lib/urls'

interface ClaimModalProps {
  storeId: number
  storeName: string
  onClose: () => void
  onSuccess: () => void
}

type Relationship = 'owner' | 'manager' | 'employee' | 'other'

export function ClaimModal({ storeId, storeName, onClose, onSuccess }: ClaimModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    claimerName: '',
    claimerEmail: '',
    claimerPhone: '',
    claimerRelationship: '' as Relationship | '',
    verificationNotes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(getClaimsApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId,
          claimerName: formData.claimerName,
          claimerEmail: formData.claimerEmail,
          claimerPhone: formData.claimerPhone,
          claimerRelationship: formData.claimerRelationship,
          verificationNotes: formData.verificationNotes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - redirect to sign in
          const currentPath = window.location.pathname
          window.location.href = `${getSignInUrl()}?redirect=${encodeURIComponent(currentPath)}`
          return
        }
        throw new Error(data.error || 'Failed to submit claim')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Claim This Listing</h2>
          <p className="mt-1 text-sm text-gray-600">
            You&apos;re claiming <span className="font-medium">{storeName}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="claimerName" className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="claimerName"
              name="claimerName"
              value={formData.claimerName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="John Smith"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="claimerEmail" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="claimerEmail"
              name="claimerEmail"
              value={formData.claimerEmail}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="john@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="claimerPhone" className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="claimerPhone"
              name="claimerPhone"
              value={formData.claimerPhone}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Relationship */}
          <div>
            <label htmlFor="claimerRelationship" className="block text-sm font-medium text-gray-700">
              Your Relationship to This Business <span className="text-red-500">*</span>
            </label>
            <select
              id="claimerRelationship"
              name="claimerRelationship"
              value={formData.claimerRelationship}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Verification Notes */}
          <div>
            <label htmlFor="verificationNotes" className="block text-sm font-medium text-gray-700">
              How can you verify ownership? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="verificationNotes"
              name="verificationNotes"
              value={formData.verificationNotes}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="I am the owner and can provide business license documentation, or you can call the store number to verify..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Describe how we can verify your relationship to this business
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
