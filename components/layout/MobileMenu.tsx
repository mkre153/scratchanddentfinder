'use client'

/**
 * Mobile Menu Panel
 *
 * Full-screen overlay menu for mobile navigation.
 * Uses lib/urls.ts for all routes (Gate 5).
 */

import Link from 'next/link'
import {
  getAllStatesUrl,
  getBlogUrl,
  getReviewsUrl,
  getAboutUrl,
  getContactUrl,
  getStoreSubmitUrl,
  getBuyersGuideUrl,
} from '@/lib/urls'

interface MobileMenuProps {
  onClose: () => void
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <nav className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl">
        <div className="flex flex-col p-6">
          {/* Close Button - 44px touch target */}
          <button
            type="button"
            onClick={onClose}
            className="mb-6 self-end min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:text-gray-700"
            aria-label="Close menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation Links - 44px touch targets */}
          <div className="flex flex-col space-y-1">
            <Link
              href={getAllStatesUrl()}
              onClick={onClose}
              className="min-h-[44px] inline-flex items-center text-lg text-gray-700 hover:text-sage-700"
            >
              Browse Stores
            </Link>
            <Link
              href={getBlogUrl()}
              onClick={onClose}
              className="min-h-[44px] inline-flex items-center text-lg text-gray-700 hover:text-sage-700"
            >
              Savings Tips
            </Link>
            <Link
              href={getReviewsUrl()}
              onClick={onClose}
              className="min-h-[44px] inline-flex items-center text-lg text-gray-700 hover:text-sage-700"
            >
              Reviews
            </Link>
            <Link
              href={getAboutUrl()}
              onClick={onClose}
              className="min-h-[44px] inline-flex items-center text-lg text-gray-700 hover:text-sage-700"
            >
              About Us
            </Link>
            <Link
              href={getContactUrl()}
              onClick={onClose}
              className="min-h-[44px] inline-flex items-center text-lg text-gray-700 hover:text-sage-700"
            >
              Contact
            </Link>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* CTA Buttons - 44px touch targets */}
          <Link
            href={getBuyersGuideUrl()}
            onClick={onClose}
            className="min-h-[44px] inline-flex items-center justify-center rounded-md bg-sage-500 px-4 font-semibold text-white hover:bg-sage-700"
          >
            Buyer&#39;s Guide
          </Link>
          <Link
            href={getStoreSubmitUrl()}
            onClick={onClose}
            className="mt-3 min-h-[44px] inline-flex items-center justify-center rounded-md bg-yellow-400 px-4 font-semibold text-gray-900 hover:bg-yellow-500"
          >
            Add Your Store
          </Link>
        </div>
      </nav>
    </div>
  )
}
