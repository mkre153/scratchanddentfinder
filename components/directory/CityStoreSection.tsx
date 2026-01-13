'use client'

/**
 * CityStoreSection — Slice 9: Maps Integration
 *
 * Client wrapper for List/Map toggle.
 * Toggle state is local UI only — no URL params, no persistence.
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { StoreCard } from './StoreCard'
import type { Store } from '@/lib/types'

// Dynamic import to avoid SSR issues with Leaflet
const StoreMap = dynamic(
  () => import('./StoreMap').then((mod) => mod.StoreMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center rounded-lg bg-gray-100">
        <span className="text-gray-500">Loading map...</span>
      </div>
    ),
  }
)

interface CityStoreSectionProps {
  stores: Store[]
  cityName: string
  cityCenter: { lat: number; lng: number }
}

export function CityStoreSection({
  stores,
  cityName,
  cityCenter,
}: CityStoreSectionProps) {
  // Local UI state only — no URL params, no persistence
  const [view, setView] = useState<'list' | 'map'>('list')

  // Derive minimal map data from stores (locked contract)
  const mapStores = stores
    .filter((s) => s.lat != null && s.lng != null)
    .map((s) => ({
      id: s.id,
      lat: s.lat as number,
      lng: s.lng as number,
    }))

  const hasMapData = mapStores.length > 0

  return (
    <>
      {/* Header with toggle */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Stores in {cityName}
        </h2>

        {/* Toggle buttons — only show if map data available */}
        {hasMapData && stores.length > 0 && (
          <div className="flex rounded-lg border border-gray-300 bg-white">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              } rounded-l-lg`}
            >
              List
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                view === 'map'
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              } rounded-r-lg`}
            >
              Map
            </button>
          </div>
        )}
      </div>

      {stores.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            No stores listed yet
          </h3>
          <p className="mt-2 text-gray-600">
            Know a scratch and dent appliance store in {cityName}? Help us grow
            our directory!
          </p>
        </div>
      ) : view === 'list' ? (
        /* Store List */
        <div className="space-y-4">
          {stores.map((store, index) => (
            <div key={store.id} id={`store-${store.id}`}>
              <StoreCard store={store} index={index} />
            </div>
          ))}
        </div>
      ) : (
        /* Map View */
        <>
          <StoreMap stores={mapStores} center={cityCenter} />
          {/* Store list below map for scroll-to behavior */}
          <div className="mt-8 space-y-4">
            {stores.map((store, index) => (
              <div key={store.id} id={`store-${store.id}`}>
                <StoreCard store={store} index={index} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
