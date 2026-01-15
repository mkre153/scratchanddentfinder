'use client'

/**
 * Claim Button
 *
 * Client component that initiates store ownership claims.
 * Opens a modal to collect verification information before submitting.
 *
 * Slice 10: Operator Control
 */

import { useState } from 'react'
import { ClaimModal } from './ClaimModal'

interface ClaimButtonProps {
  storeId: number
  storeName: string
  isAlreadyClaimed?: boolean
  className?: string
}

export function ClaimButton({
  storeId,
  storeName,
  isAlreadyClaimed = false,
  className = '',
}: ClaimButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [success, setSuccess] = useState(false)

  // Don't show button if already claimed
  if (isAlreadyClaimed) {
    return null
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Claim submitted! We&apos;ll review it shortly.</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
        title={`Claim ownership of ${storeName}`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>Claim This Listing</span>
      </button>

      {showModal && (
        <ClaimModal
          storeId={storeId}
          storeName={storeName}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setSuccess(true)
          }}
        />
      )}
    </>
  )
}
