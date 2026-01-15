'use client'

/**
 * Email Verification Modal
 *
 * Inline modal for entering the 6-digit verification code.
 * Shows after form submission, no page redirect.
 */

import { useState, useRef, useEffect } from 'react'

interface VerificationModalProps {
  email: string
  submissionId: string
  onSuccess: () => void
  onResend: () => Promise<void>
}

export function VerificationModal({
  email,
  submissionId,
  onSuccess,
  onResend,
}: VerificationModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError(null)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all filled
    if (value && index === 5 && newCode.every((d) => d !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (codeString: string) => {
    setIsVerifying(true)
    setError(null)

    try {
      const response = await fetch('/api/submissions/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, code: codeString }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid code')
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        return
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
      setResendCooldown(60) // 60 second cooldown
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch {
      setError('Failed to resend code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            Check your email
          </h3>

          {/* Description */}
          <p className="mt-2 text-gray-600">
            We&apos;ve sent a 6-digit code to
          </p>
          <p className="font-medium text-gray-900">{email}</p>

          {/* Code Input */}
          <div className="mt-6 flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
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

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          {/* Verify Button */}
          <button
            onClick={() => handleVerify(code.join(''))}
            disabled={code.some((d) => !d) || isVerifying}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Verify & Submit'}
          </button>

          {/* Resend Link */}
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
