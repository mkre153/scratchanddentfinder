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
            <p className="mt-4 text-sm">
              List your scratch and dent appliance store for free. Upgrade to
              featured for premium visibility.
            </p>
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
          <p>&copy; 2026 Scratch & Dent Appliance Directory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
