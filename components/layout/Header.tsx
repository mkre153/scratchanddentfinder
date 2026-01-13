/**
 * Header Component
 *
 * Minimal navigation for Slice 1.
 * Uses lib/urls.ts for all route generation (Gate 5).
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

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={getHomepageUrl()} className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-700">
              Scratch & Dent Locator
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <Link
              href={getHomepageUrl()}
              className="text-gray-600 hover:text-blue-700"
            >
              Home
            </Link>
            <Link
              href={getAllStatesUrl()}
              className="text-gray-600 hover:text-blue-700"
            >
              Browse States
            </Link>
            <Link
              href={getAdvertiseUrl()}
              className="text-gray-600 hover:text-blue-700"
            >
              Advertise With Us
            </Link>
            <Link
              href={getAboutUrl()}
              className="text-gray-600 hover:text-blue-700"
            >
              About Us
            </Link>
            <Link
              href={getContactUrl()}
              className="text-gray-600 hover:text-blue-700"
            >
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <Link
            href={getStoreSubmitUrl()}
            className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
          >
            + Add Your Store
          </Link>
        </div>
      </nav>
    </header>
  )
}
