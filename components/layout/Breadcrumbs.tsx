/**
 * Breadcrumbs Component
 *
 * Navigation breadcrumbs for directory pages.
 * Uses lib/urls.ts for all route generation (Gate 5).
 */

import Link from 'next/link'
import { getAllStatesUrl, getStateUrl } from '@/lib/urls'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-blue-700">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * Build breadcrumbs for state page
 */
export function getStateBreadcrumbs(stateName: string): BreadcrumbItem[] {
  return [
    { label: 'Scratch and Dent Appliances', href: getAllStatesUrl() },
    { label: stateName },
  ]
}

/**
 * Build breadcrumbs for city page
 */
export function getCityBreadcrumbs(
  state: { slug: string; name: string },
  cityName: string
): BreadcrumbItem[] {
  return [
    { label: 'Scratch and Dent Appliances', href: getAllStatesUrl() },
    { label: state.name, href: getStateUrl(state) },
    { label: cityName },
  ]
}
