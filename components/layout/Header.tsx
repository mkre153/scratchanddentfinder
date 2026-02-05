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
  getBlogUrl,
  getBuyersGuideUrl,
} from '@/lib/urls'
import { MobileMenuButton } from './MobileMenuButton'

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - 44px touch target */}
          <Link href={getHomepageUrl()} className="inline-flex min-h-[44px] items-center gap-2">
            <span className="text-xl font-bold text-sage-700">
              Scratch & Dent Finder
            </span>
          </Link>

          {/* Desktop Navigation Links - min 44px touch targets */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <Link
              href={getHomepageUrl()}
              className="inline-flex min-h-[44px] items-center px-2 text-gray-600 hover:text-sage-700"
            >
              Home
            </Link>
            <Link
              href={getAllStatesUrl()}
              className="inline-flex min-h-[44px] items-center px-2 text-gray-600 hover:text-sage-700"
            >
              Browse States
            </Link>
            <Link
              href={getBlogUrl()}
              className="inline-flex min-h-[44px] items-center px-2 text-gray-600 hover:text-sage-700"
            >
              Blog
            </Link>
            <Link
              href={getAdvertiseUrl()}
              className="inline-flex min-h-[44px] items-center px-2 text-gray-600 hover:text-sage-700"
            >
              Advertise With Us
            </Link>
            <Link
              href={getAboutUrl()}
              className="inline-flex min-h-[44px] items-center px-2 text-gray-600 hover:text-sage-700"
            >
              About Us
            </Link>
            <Link
              href={getContactUrl()}
              className="inline-flex min-h-[44px] items-center px-2 text-gray-600 hover:text-sage-700"
            >
              Contact
            </Link>
          </div>

          {/* CTA + Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Buyer's Guide CTA - hidden on small mobile, 44px touch target */}
            <Link
              href={getBuyersGuideUrl()}
              className="hidden sm:inline-flex min-h-[44px] items-center rounded-md bg-sage-500 px-4 text-sm font-semibold text-white hover:bg-sage-700"
            >
              Buyer's Guide
            </Link>

            {/* Add Your Store CTA - hidden on small mobile, 44px touch target */}
            <Link
              href={getStoreSubmitUrl()}
              className="hidden sm:inline-flex min-h-[44px] items-center rounded-md bg-yellow-400 px-4 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
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
