'use client'

/**
 * Mobile Menu Toggle Button
 *
 * Client component for menu state management.
 * Minimal client footprint - only handles toggle state.
 * Slice 12: Presentation Parity
 */

import { useState } from 'react'
import { MobileMenu } from './MobileMenu'

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="md:hidden p-2 text-gray-600 hover:text-sage-700"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {/* Hamburger / Close Icon */}
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && <MobileMenu onClose={() => setIsOpen(false)} />}
    </>
  )
}
