'use client'

/**
 * Deal Post Form (Client Component)
 *
 * Handles deal submission with photo upload, store type-ahead,
 * and email verification via modal.
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  validateDealForm,
  APPLIANCE_TYPES,
  CONDITION_OPTIONS,
  type DealFormData,
} from '@/lib/deal-submission'
import { US_STATES } from '@/lib/store-submission'
import { DealPhotoUpload } from '@/components/deals/DealPhotoUpload'
import { VerificationModal } from '@/components/submission/VerificationModal'

interface StoreSearchResult {
  id: number
  name: string
  city: string
  stateCode: string
}

export function DealPostForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [dealStatus, setDealStatus] = useState<'live' | 'under_review' | null>(null)

  // Verification modal state
  const [showVerification, setShowVerification] = useState(false)
  const [dealId, setDealId] = useState<string | null>(null)

  // Store search state
  const [storeQuery, setStoreQuery] = useState('')
  const [storeResults, setStoreResults] = useState<StoreSearchResult[]>([])
  const [showStoreDropdown, setShowStoreDropdown] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const [formData, setFormData] = useState<DealFormData>({
    submitterName: '',
    submitterEmail: '',
    submitterPhone: '',
    storeName: '',
    storeId: null,
    title: '',
    applianceType: '',
    brand: '',
    modelNumber: '',
    originalPrice: '',
    dealPrice: '',
    condition: '',
    damageDescription: '',
    description: '',
    city: '',
    state: '',
    zip: '',
    photoPaths: [],
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  // Store name search
  const handleStoreSearch = useCallback(
    (value: string) => {
      setStoreQuery(value)
      setFormData((prev) => ({ ...prev, storeName: value, storeId: null }))

      if (searchTimeout) clearTimeout(searchTimeout)

      if (value.length < 2) {
        setStoreResults([])
        setShowStoreDropdown(false)
        return
      }

      const timeout = setTimeout(async () => {
        try {
          const response = await fetch(
            `/api/stores/search/?q=${encodeURIComponent(value)}`
          )
          if (response.ok) {
            const data = await response.json()
            setStoreResults(data.stores || [])
            setShowStoreDropdown(true)
          }
        } catch {
          // Silent fail on search
        }
      }, 300)

      setSearchTimeout(timeout)
    },
    [searchTimeout]
  )

  const handleStoreSelect = (store: StoreSearchResult) => {
    setStoreQuery(store.name)
    setFormData((prev) => ({
      ...prev,
      storeName: store.name,
      storeId: store.id,
      city: store.city || prev.city,
      state: store.stateCode || prev.state,
    }))
    setShowStoreDropdown(false)
  }

  const handlePhotosChange = (paths: string[]) => {
    setFormData((prev) => ({ ...prev, photoPaths: paths }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    const result = validateDealForm(formData)
    if (!result.valid) {
      setErrors(result.errors)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/deals/start/', {
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

      setDealId(data.dealId)
      setShowVerification(true)
    } catch (err) {
      setSubmitError('Failed to submit deal. Please try again.')
      console.error('Deal submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (!dealId) return

    const response = await fetch('/api/deals/start/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!response.ok) throw new Error('Failed to resend code')
    const data = await response.json()
    setDealId(data.dealId)
  }

  const handleVerificationSuccess = () => {
    setShowVerification(false)
    setSubmitSuccess(true)
  }

  // Success state
  if (submitSuccess) {
    return (
      <div className="text-center py-12">
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
          {dealStatus === 'live' ? 'Your Deal is Live!' : 'Deal Submitted!'}
        </h3>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">
          {dealStatus === 'live'
            ? 'Your deal has been published and is now visible to shoppers. You\'ll receive a link via email.'
            : 'Your deal is under review and will be published within 24 hours. We\'ll email you when it goes live.'}
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => router.push('/deals/')}
            className="rounded-lg bg-sage-500 px-4 py-2 text-white hover:bg-sage-700"
          >
            Browse Deals
          </button>
          <button
            onClick={() => {
              setSubmitSuccess(false)
              setDealId(null)
              setFormData({
                submitterName: formData.submitterName,
                submitterEmail: formData.submitterEmail,
                submitterPhone: formData.submitterPhone,
                storeName: '',
                storeId: null,
                title: '',
                applianceType: '',
                brand: '',
                modelNumber: '',
                originalPrice: '',
                dealPrice: '',
                condition: '',
                damageDescription: '',
                description: '',
                city: '',
                state: '',
                zip: '',
                photoPaths: [],
              })
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Post Another Deal
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {submitError && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">{submitError}</div>
        )}

        {/* Section: Your Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="submitterName" className="block text-sm font-medium text-gray-700">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="submitterName"
                name="submitterName"
                value={formData.submitterName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.submitterName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.submitterName && (
                <p className="mt-1 text-sm text-red-500">{errors.submitterName}</p>
              )}
            </div>
            <div>
              <label htmlFor="submitterEmail" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="submitterEmail"
                name="submitterEmail"
                value={formData.submitterEmail}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.submitterEmail ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">We&apos;ll send a verification code</p>
              {errors.submitterEmail && (
                <p className="mt-1 text-sm text-red-500">{errors.submitterEmail}</p>
              )}
            </div>
            <div>
              <label htmlFor="submitterPhone" className="block text-sm font-medium text-gray-700">
                Phone <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="tel"
                id="submitterPhone"
                name="submitterPhone"
                value={formData.submitterPhone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                Store Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                id="storeName"
                value={storeQuery}
                onChange={(e) => handleStoreSearch(e.target.value)}
                onBlur={() => setTimeout(() => setShowStoreDropdown(false), 200)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search existing stores..."
                autoComplete="off"
              />
              {showStoreDropdown && storeResults.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {storeResults.map((store) => (
                    <li key={store.id}>
                      <button
                        type="button"
                        onClick={() => handleStoreSelect(store)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        <span className="font-medium">{store.name}</span>
                        <span className="text-gray-500 ml-1">
                          — {store.city}, {store.stateCode}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Section: Deal Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Details</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Deal Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='e.g., "Samsung French Door Fridge - Side Dent"'
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="applianceType" className="block text-sm font-medium text-gray-700">
                  Appliance Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="applianceType"
                  name="applianceType"
                  value={formData.applianceType}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.applianceType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select type...</option>
                  {APPLIANCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.applianceType && (
                  <p className="mt-1 text-sm text-red-500">{errors.applianceType}</p>
                )}
              </div>
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.condition ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select condition...</option>
                  {CONDITION_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-500">{errors.condition}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                  Brand <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Samsung, LG, Whirlpool"
                />
              </div>
              <div>
                <label htmlFor="modelNumber" className="block text-sm font-medium text-gray-700">
                  Model Number <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  id="modelNumber"
                  name="modelNumber"
                  value={formData.modelNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">
                  Original Price <span className="text-gray-400">(optional)</span>
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`block w-full rounded-lg border pl-7 pr-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.originalPrice && (
                  <p className="mt-1 text-sm text-red-500">{errors.originalPrice}</p>
                )}
              </div>
              <div>
                <label htmlFor="dealPrice" className="block text-sm font-medium text-gray-700">
                  Deal Price <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="dealPrice"
                    name="dealPrice"
                    value={formData.dealPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`block w-full rounded-lg border pl-7 pr-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dealPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.dealPrice && (
                  <p className="mt-1 text-sm text-red-500">{errors.dealPrice}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="damageDescription" className="block text-sm font-medium text-gray-700">
                Damage Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="damageDescription"
                name="damageDescription"
                value={formData.damageDescription}
                onChange={handleChange}
                rows={3}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.damageDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the cosmetic damage — e.g., small dent on right side panel"
              />
              {errors.damageDescription && (
                <p className="mt-1 text-sm text-red-500">{errors.damageDescription}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tell shoppers about this deal — warranty info, why it's a great buy, etc."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section: Location */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
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
              />
              {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
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
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
            </div>
            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                ZIP <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12345"
              />
            </div>
          </div>
        </div>

        {/* Section: Photos */}
        <DealPhotoUpload
          dealId={dealId}
          photoPaths={formData.photoPaths}
          onPhotosChange={handlePhotosChange}
        />

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-sage-500 px-4 py-3 font-semibold text-white transition hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Post Your Deal'}
          </button>
          <p className="mt-3 text-center text-sm text-gray-500">
            Deals are moderated and expire after 30 days. Free to post.
          </p>
        </div>
      </form>

      {/* Verification Modal — reuses existing pattern */}
      {showVerification && dealId && (
        <DealVerificationModal
          email={formData.submitterEmail}
          dealId={dealId}
          onSuccess={handleVerificationSuccess}
          onResend={handleResendCode}
          onStatusChange={(status) => setDealStatus(status)}
        />
      )}
    </>
  )
}

/**
 * Deal-specific verification modal
 * Wraps the pattern from VerificationModal but hits /api/deals/verify
 */
function DealVerificationModal({
  email,
  dealId,
  onSuccess,
  onResend,
  onStatusChange,
}: {
  email: string
  dealId: string
  onSuccess: () => void
  onResend: () => Promise<void>
  onStatusChange: (status: 'live' | 'under_review') => void
}) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useState<(HTMLInputElement | null)[]>([])[0]

  // Resend cooldown timer
  useState(() => {
    // Auto-focus handled by ref
  })

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError(null)

    if (value && index < 5) {
      inputRefs[index + 1]?.focus()
    }

    if (value && index === 5 && newCode.every((d) => d !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      setCode(pastedData.split(''))
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (codeString: string) => {
    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch('/api/deals/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, code: codeString }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid code')
        setCode(['', '', '', '', '', ''])
        inputRefs[0]?.focus()
        return
      }

      if (data.status) {
        onStatusChange(data.status)
      }
      onSuccess()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setIsResending(true)
    setError(null)

    try {
      await onResend()
      setResendCooldown(60)
      setCode(['', '', '', '', '', ''])
      inputRefs[0]?.focus()
    } catch {
      setError('Failed to resend code.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h3 className="mt-4 text-xl font-semibold text-gray-900">Check your email</h3>
          <p className="mt-2 text-gray-600">We&apos;ve sent a 6-digit code to</p>
          <p className="font-medium text-gray-900">{email}</p>

          <div className="mt-6 flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isVerifying}
                className={`h-14 w-12 rounded-lg border-2 text-center text-2xl font-bold transition-colors
                  ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                  focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                  disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            onClick={() => handleVerify(code.join(''))}
            disabled={code.some((d) => !d) || isVerifying}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Verify & Publish'}
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Didn&apos;t receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className="font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {isResending
                ? 'Sending...'
                : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
