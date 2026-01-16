'use client'

/**
 * Store Submission Form (Client Component)
 *
 * Slice 4: Handles form state and submission with email verification.
 * Creates StoreSubmission records only (pending review after email verification).
 * Does NOT create Store records or affect the directory.
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import {
  validateSubmission,
  US_STATES,
  type SubmissionFormData,
} from '@/lib/store-submission'
import { VerificationModal } from '@/components/submission/VerificationModal'
import { formatPhoneNumber } from '@/lib/format'

// Google Places types
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete
        }
      }
    }
  }
}

export function StoreSubmissionForm() {
  const router = useRouter()
  const businessNameRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [googleLoaded, setGoogleLoaded] = useState(false)

  // Verification modal state
  const [showVerification, setShowVerification] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)

  const [formData, setFormData] = useState<SubmissionFormData>({
    businessName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipcode: '',
    phone: '',
    email: '',
    website: '',
    googlePlaceId: '',
  })

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!googleLoaded || !businessNameRef.current || autocompleteRef.current) return

    const autocomplete = new window.google!.maps.places.Autocomplete(
      businessNameRef.current,
      {
        types: ['establishment'],
        componentRestrictions: { country: 'us' },
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'address_components',
          'formatted_phone_number',
          'website',
        ],
      }
    )

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.place_id) return

      // Parse address components
      let streetNumber = ''
      let streetName = ''
      let city = ''
      let state = ''
      let zipcode = ''

      place.address_components?.forEach((component) => {
        const types = component.types
        if (types.includes('street_number')) {
          streetNumber = component.long_name
        } else if (types.includes('route')) {
          streetName = component.long_name
        } else if (types.includes('locality')) {
          city = component.long_name
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name
        } else if (types.includes('postal_code')) {
          zipcode = component.long_name
        }
      })

      const streetAddress = streetNumber
        ? `${streetNumber} ${streetName}`
        : streetName

      // Update form with place data
      setFormData((prev) => ({
        ...prev,
        businessName: place.name || prev.businessName,
        streetAddress: streetAddress || prev.streetAddress,
        city: city || prev.city,
        state: state || prev.state,
        zipcode: zipcode || prev.zipcode,
        phone: place.formatted_phone_number?.replace(/\D/g, '') || prev.phone,
        website: place.website || prev.website,
        googlePlaceId: place.place_id || '',
      }))

      // Clear errors for auto-filled fields
      setErrors({})
    })

    autocompleteRef.current = autocomplete
  }, [googleLoaded])

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

    // Submit via API route - this sends verification email
    try {
      const response = await fetch('/api/submissions/start/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          throw new Error(data.error || 'Failed to submit')
        }
        return
      }

      // Show verification modal
      setSubmissionId(data.submissionId)
      setShowVerification(true)
    } catch (err) {
      setSubmitError('Failed to submit. Please try again.')
      console.error('Submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (!submissionId) return

    const response = await fetch('/api/submissions/start/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error('Failed to resend code')
    }

    const data = await response.json()
    setSubmissionId(data.submissionId)
  }

  const handleVerificationSuccess = () => {
    setShowVerification(false)
    setSubmitSuccess(true)
  }

  // Success state
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
          Submission Received!
        </h3>
        <p className="mt-2 text-gray-600">
          Thank you for submitting your store. We will review your submission
          and add it to our directory within 24-48 hours.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 rounded-lg bg-sage-500 px-4 py-2 text-white hover:bg-sage-700"
        >
          Return Home
        </button>
      </div>
    )
  }

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

  return (
    <>
      {/* Load Google Places API */}
      {googleApiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`}
          onLoad={() => setGoogleLoaded(true)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">{submitError}</div>
        )}

        {/* Business Name with Google Places Autocomplete */}
        <div>
          <label
            htmlFor="businessName"
            className="block text-sm font-medium text-gray-700"
          >
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            ref={businessNameRef}
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.businessName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Start typing to search..."
          />
          {googleApiKey && (
            <p className="mt-1 text-xs text-gray-500">
              Type your business name to auto-fill from Google
            </p>
          )}
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

        {/* City, State & Zipcode Row */}
        <div className="grid gap-4 sm:grid-cols-3">
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

          {/* Zipcode */}
          <div>
            <label
              htmlFor="zipcode"
              className="block text-sm font-medium text-gray-700"
            >
              Zipcode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="zipcode"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.zipcode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12345"
            />
            {errors.zipcode && (
              <p className="mt-1 text-sm text-red-500">{errors.zipcode}</p>
            )}
          </div>
        </div>

        {/* Phone (Required) */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone ? formatPhoneNumber(formData.phone) : ''}
            onChange={(e) => {
              // Store only digits
              const digits = e.target.value.replace(/\D/g, '')
              setFormData((prev) => ({ ...prev, phone: digits }))
              if (errors.phone) {
                setErrors((prev) => {
                  const next = { ...prev }
                  delete next.phone
                  return next
                })
              }
            }}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Email (Required) */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="you@yourstore.com"
          />
          <p className="mt-1 text-xs text-gray-500">
            We&apos;ll send a verification code to this email
          </p>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
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
            className="w-full rounded-lg bg-sage-500 px-4 py-3 font-semibold text-white transition hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Store'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Submissions are reviewed before appearing in the directory.
        </p>
      </form>

      {/* Verification Modal */}
      {showVerification && submissionId && (
        <VerificationModal
          email={formData.email}
          submissionId={submissionId}
          onSuccess={handleVerificationSuccess}
          onResend={handleResendCode}
        />
      )}
    </>
  )
}
