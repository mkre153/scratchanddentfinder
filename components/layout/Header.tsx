/**
 * Header Component
 *
 * Navigation with mobile menu support.
 * Uses lib/urls.ts for all route generation (Gate 5).
 */

import Link from 'next/link'
import {
  getHomepageUrl,
  getAllStatesUrl,
  getBlogUrl,
  getReviewsUrl,
  getBuyersGuideUrl,
} from '@/lib/urls'
import { MobileMenuButton } from './MobileMenuButton'

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Left: Logo — flex-1 for balanced centering */}
          <div className="flex-1">
            <Link href={getHomepageUrl()} className="inline-flex min-h-[44px] items-center gap-2">
              <span className="text-xl font-bold text-sage-700">
                Scratch & Dent Finder
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links - min 44px touch targets */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <Link
              href={getAllStatesUrl()}
              className="inline-flex min-h-[44px] items-center px-2 text-gray-600 hover:text-sage-700"
            >
              Browse Stores
            </Link>
            <Link
              href={getBlogUrl()}
              className="inline-flex min-h-[44px] items-center px-2 text-gray-600 hover:text-sage-700"
            >
              Savings Tips
            </Link>
            <Link
              href={getReviewsUrl()}
              className="inline-flex min-h-[44px] items-center px-2 text-gray-600 hover:text-sage-700"
            >
              Reviews
            </Link>
          </div>

          {/* Right: CTA + Mobile Menu — flex-1 for balanced centering */}
          <div className="flex-1 flex items-center justify-end gap-2">
            {/* Buyer's Guide CTA - hidden on small mobile, 44px touch target */}
            <Link
              href={getBuyersGuideUrl()}
              className="hidden sm:inline-flex min-h-[44px] items-center rounded-md bg-sage-500 px-4 text-sm font-semibold text-white hover:bg-sage-600"
            >
              Buyer&#39;s Guide
            </Link>

            {/* Mobile Menu Button */}
            <MobileMenuButton />
          </div>
        </div>
      </nav>
    </header>
  )
}
