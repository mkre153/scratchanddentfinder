'use client'

import { useRouter } from 'next/navigation'
import { USMap as BaseMap, type StateConfig } from '@/components/us-map'
import type { State } from '@/lib/types'
import { getStateUrl } from '@/lib/urls'

const SLUG_TO_ABBR: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR',
  california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE',
  florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
  kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new-hampshire': 'NH', 'new-jersey': 'NJ', 'new-mexico': 'NM', 'new-york': 'NY',
  'north-carolina': 'NC', 'north-dakota': 'ND', ohio: 'OH', oklahoma: 'OK',
  oregon: 'OR', pennsylvania: 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC',
  'south-dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT',
  vermont: 'VT', virginia: 'VA', washington: 'WA', 'west-virginia': 'WV',
  wisconsin: 'WI', wyoming: 'WY',
}

const ABBR_TO_SLUG = Object.fromEntries(
  Object.entries(SLUG_TO_ABBR).map(([slug, abbr]) => [abbr, slug])
)

export function USMapSection({ states }: { states: State[] }) {
  const router = useRouter()
  const stateBySlug = new Map(states.map((s) => [s.slug, s]))

  const stateConfig: Record<string, StateConfig> = {}
  for (const state of states) {
    const abbr = SLUG_TO_ABBR[state.slug]
    if (!abbr) continue
    const count = state.storeCount
    stateConfig[abbr] = {
      color: count > 200 ? '#4a7a4a' : count > 50 ? '#6b9a6b' : count > 0 ? '#a3c4a3' : '#e5e7eb',
      hoverColor: count > 0 ? '#3d6a3d' : '#d1d5db',
      description: `${state.name} — ${count} stores`,
    }
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
          Find Stores in Your State
        </h2>
        <p className="mb-8 text-center text-gray-600">
          Click your state to find scratch &amp; dent stores near you.
        </p>
        <div className="mx-auto max-w-4xl">
          <BaseMap
            stateConfig={stateConfig}
            defaultColor="#e5e7eb"
            defaultHoverColor="#d1d5db"
            strokeColor="#ffffff"
            strokeWidth={1.5}
            showLabels
            onStateClick={(code) => {
              const slug = ABBR_TO_SLUG[code]
              const state = slug ? stateBySlug.get(slug) : undefined
              if (state) router.push(getStateUrl(state))
            }}
          />
        </div>
      </div>
    </section>
  )
}
