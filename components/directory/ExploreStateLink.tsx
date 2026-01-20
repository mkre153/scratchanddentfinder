/**
 * ExploreStateLink Component
 *
 * Upward link from City → State page for SEO internal linking.
 * Based on competitor analysis: strengthens pillar structure.
 * Uses lib/urls.ts for link generation (Gate 5).
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getStateUrl } from '@/lib/urls'
import type { State } from '@/lib/types'

interface ExploreStateLinkProps {
  state: State
}

export function ExploreStateLink({ state }: ExploreStateLinkProps) {
  return (
    <section className="bg-sage-50 py-8">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <Link
          href={getStateUrl(state)}
          rel="up"
          className="inline-flex items-center gap-2 rounded-lg bg-sage-600 px-6 py-3 font-medium text-white transition-colors hover:bg-sage-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Explore More {state.name} Cities
        </Link>
      </div>
    </section>
  )
}
