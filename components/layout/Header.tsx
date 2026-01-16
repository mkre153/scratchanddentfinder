/**
 * Header Component
 *
 * Navigation with mobile menu support.
 * Uses lib/urls.ts for all route generation (Gate 5).
 * Slice 12: Added mobile navigation.
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
import { MobileMenuButton } from './MobileMenuButton'

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={getHomepageUrl()} className="flex items-center gap-2">
            <span className="text-xl font-bold text-sage-700">
              Scratch & Dent Finder
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <Link
              href={getHomepageUrl()}
              className="text-gray-600 hover:text-sage-700"
            >
              Home
            </Link>
            <Link
              href={getAllStatesUrl()}
              className="text-gray-600 hover:text-sage-700"
            >
              Browse States
            </Link>
            <Link
              href={getAdvertiseUrl()}
              className="text-gray-600 hover:text-sage-700"
            >
              Advertise With Us
            </Link>
            <Link
              href={getAboutUrl()}
              className="text-gray-600 hover:text-sage-700"
            >
              About Us
            </Link>
            <Link
              href={getContactUrl()}
              className="text-gray-600 hover:text-sage-700"
            >
              Contact
            </Link>
          </div>

          {/* CTA + Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* CTA Button - hidden on small mobile */}
            <Link
              href={getStoreSubmitUrl()}
              className="hidden sm:block rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
            >
              + Add Your Store
            </Link>

            {/* Mobile Menu Button */}
            <MobileMenuButton />
          </div>
        </div>
      </nav>
    </header>
  )
}
