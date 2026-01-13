'use client'

/**
 * Store Submission Form (Client Component)
 *
 * Slice 4: Handles form state and submission.
 * Creates StoreSubmission records only (pending review).
 * Does NOT create Store records or affect the directory.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  validateSubmission,
  US_STATES,
  type SubmissionFormData,
} from '@/lib/store-submission'
import { createStoreSubmission } from '@/lib/queries'

export function StoreSubmissionForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [formData, setFormData] = useState<SubmissionFormData>({
    businessName: '',
    streetAddress: '',
    city: '',
    state: '',
    phone: '',
    website: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    // Validate
    const result = validateSubmission(formData)

    if (!result.valid) {
      setErrors(result.errors)
      setIsSubmitting(false)
      return
    }

    // Submit
    try {
      await createStoreSubmission(result.data!)
      setSubmitSuccess(true)
    } catch (err) {
      setSubmitError('Failed to submit. Please try again.')
      console.error('Submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Submission Received
        </h3>
        <p className="mt-2 text-gray-600">
          Thank you for submitting your store. We will review your submission
          and add it to our directory if it meets our guidelines.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
        >
          Return Home
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{submitError}</div>
      )}

      {/* Business Name */}
      <div>
        <label
          htmlFor="businessName"
          className="block text-sm font-medium text-gray-700"
        >
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="businessName"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.businessName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Your Store Name"
        />
        {errors.businessName && (
          <p className="mt-1 text-sm text-red-500">{errors.businessName}</p>
        )}
      </div>

      {/* Street Address */}
      <div>
        <label
          htmlFor="streetAddress"
          className="block text-sm font-medium text-gray-700"
        >
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="streetAddress"
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.streetAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="123 Main Street"
        />
        {errors.streetAddress && (
          <p className="mt-1 text-sm text-red-500">{errors.streetAddress}</p>
        )}
      </div>

      {/* City & State Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="City"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700"
          >
            State <span className="text-red-500">*</span>
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.state ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select State</option>
            {US_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-sm text-red-500">{errors.state}</p>
          )}
        </div>
      </div>

      {/* Phone (Optional) */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone Number <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="(555) 123-4567"
        />
      </div>

      {/* Website (Optional) */}
      <div>
        <label
          htmlFor="website"
          className="block text-sm font-medium text-gray-700"
        >
          Website <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.website ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://yourstore.com"
        />
        {errors.website && (
          <p className="mt-1 text-sm text-red-500">{errors.website}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Store'}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Submissions are reviewed before appearing in the directory.
      </p>
    </form>
  )
}
