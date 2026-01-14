'use client'

/**
 * Mobile Menu Panel
 *
 * Full-screen overlay menu for mobile navigation.
 * Uses lib/urls.ts for all routes (Gate 5).
 * Slice 12: Presentation Parity
 */

import Link from 'next/link'
import {
  getHomepageUrl,
  getAllStatesUrl,
  getAdvertiseUrl,
  getAboutUrl,
  getContactUrl,
  getStoreSubmitUrl,
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
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="mb-6 self-end p-2 text-gray-500 hover:text-gray-700"
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

          {/* Navigation Links */}
          <div className="flex flex-col space-y-4">
            <Link
              href={getHomepageUrl()}
              onClick={onClose}
              className="text-lg text-gray-700 hover:text-blue-700"
            >
              Home
            </Link>
            <Link
              href={getAllStatesUrl()}
              onClick={onClose}
              className="text-lg text-gray-700 hover:text-blue-700"
            >
              Browse States
            </Link>
            <Link
              href={getAdvertiseUrl()}
              onClick={onClose}
              className="text-lg text-gray-700 hover:text-blue-700"
            >
              Advertise With Us
            </Link>
            <Link
              href={getAboutUrl()}
              onClick={onClose}
              className="text-lg text-gray-700 hover:text-blue-700"
            >
              About Us
            </Link>
            <Link
              href={getContactUrl()}
              onClick={onClose}
              className="text-lg text-gray-700 hover:text-blue-700"
            >
              Contact
            </Link>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* CTA Button */}
          <Link
            href={getStoreSubmitUrl()}
            onClick={onClose}
            className="rounded-md bg-yellow-400 px-4 py-3 text-center font-semibold text-gray-900 hover:bg-yellow-500"
          >
            + Add Your Store
          </Link>
        </div>
      </nav>
    </div>
  )
}
