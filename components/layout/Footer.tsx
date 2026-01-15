/**
 * Footer Component
 *
 * Minimal footer for Slice 1.
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

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={getHomepageUrl()}
                  className="hover:text-white"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={getAllStatesUrl()}
                  className="hover:text-white"
                >
                  Browse All States
                </Link>
              </li>
              <li>
                <Link
                  href={getAdvertiseUrl()}
                  className="hover:text-white"
                >
                  Advertise
                </Link>
              </li>
              <li>
                <Link
                  href={getAboutUrl()}
                  className="hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href={getContactUrl()}
                  className="hover:text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Section */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              For Store Owners
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={getStoreSubmitUrl()}
                  className="hover:text-white"
                >
                  Add Your Store
                </Link>
              </li>
              <li>
                <Link
                  href={getAdvertiseUrl()}
                  className="hover:text-white"
                >
                  Get Featured
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>scratchanddentfinder@gmail.com</li>
              <li>business@scratchanddentfinder.com</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; 2026 Scratch & Dent Finder. Operated by MK153 Inc.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/privacy/" className="hover:text-white">
              Privacy Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/terms/" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
