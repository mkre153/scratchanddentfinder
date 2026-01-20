'use client'

/**
 * CityStoreSection — Slice 9: Maps Integration
 *
 * Client wrapper for List/Map toggle.
 * Toggle state is local UI only — no URL params, no persistence.
 */

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { StoreCard } from './StoreCard'
import { getStoreSubmitUrl } from '@/lib/urls'
import { useUserLocation } from '@/lib/contexts/UserLocationContext'
import { haversineDistance } from '@/lib/utils/distance'
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
  // SEO: Sort defaults to 'default' (featured first, then alphabetical)
  // Distance sort is OPT-IN only when user location is available
  const [sortBy, setSortBy] = useState<'default' | 'distance'>('default')
  const userLocation = useUserLocation()

  // Calculate distances and sort when user has location and opts in
  const sortedStores = useMemo(() => {
    if (sortBy !== 'distance' || !userLocation?.coords) {
      return stores // Return original order (server-provided)
    }

    // Sort by distance (featured stores still come first)
    return [...stores].sort((a, b) => {
      // Featured stores always first
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1

      // Then by distance
      const distA = a.lat != null && a.lng != null
        ? haversineDistance(userLocation.coords!.lat, userLocation.coords!.lng, a.lat, a.lng)
        : Infinity
      const distB = b.lat != null && b.lng != null
        ? haversineDistance(userLocation.coords!.lat, userLocation.coords!.lng, b.lat, b.lng)
        : Infinity
      return distA - distB
    })
  }, [stores, sortBy, userLocation?.coords])

  // Split stores into featured and regular
  const featuredStores = sortedStores.filter((s) => s.isFeatured)
  const regularStores = sortedStores.filter((s) => !s.isFeatured)

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
      {/* Header with toggles */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Stores in {cityName}
        </h2>

        <div className="flex items-center gap-3">
          {/* Sort toggle — only show when user location is available */}
          {userLocation?.coords && stores.length > 1 && (
            <button
              onClick={() => setSortBy(sortBy === 'distance' ? 'default' : 'distance')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                sortBy === 'distance'
                  ? 'bg-sage-100 text-sage-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {sortBy === 'distance' ? '✓ Sorted by distance' : 'Sort by distance'}
            </button>
          )}

          {/* View toggle buttons — only show if map data available */}
          {hasMapData && stores.length > 0 && (
            <div className="flex rounded-lg border border-gray-300 bg-white">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-sage-500 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                } rounded-l-lg`}
              >
                List
              </button>
              <button
                onClick={() => setView('map')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  view === 'map'
                    ? 'bg-sage-500 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                } rounded-r-lg`}
              >
                Map
              </button>
            </div>
          )}
        </div>
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
          <Link
            href={getStoreSubmitUrl()}
            className="mt-4 inline-flex items-center gap-1 rounded-md bg-sage-500 px-4 py-2 text-sm font-medium text-white hover:bg-sage-700"
          >
            + Add Your Store
          </Link>
        </div>
      ) : view === 'list' ? (
        /* Store List with Featured Section */
        <>
          {/* Featured Stores Section */}
          {featuredStores.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Featured Stores</h3>
              </div>
              <div className="space-y-4">
                {featuredStores.map((store) => (
                  <div key={store.id} id={`store-${store.id}`}>
                    <StoreCard store={store} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Stores Section */}
          {regularStores.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                All Stores ({regularStores.length})
              </h3>
              <div className="space-y-4">
                {regularStores.map((store, index) => (
                  <div key={store.id} id={`store-${store.id}`}>
                    <StoreCard store={store} index={index} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Map View */
        <>
          <StoreMap stores={mapStores} center={cityCenter} />
          {/* Store list below map for scroll-to behavior */}
          <div className="mt-8">
            {/* Featured Stores Section */}
            {featuredStores.length > 0 && (
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Featured Stores</h3>
                </div>
                <div className="space-y-4">
                  {featuredStores.map((store) => (
                    <div key={store.id} id={`store-${store.id}`}>
                      <StoreCard store={store} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Stores Section */}
            {regularStores.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  All Stores ({regularStores.length})
                </h3>
                <div className="space-y-4">
                  {regularStores.map((store, index) => (
                    <div key={store.id} id={`store-${store.id}`}>
                      <StoreCard store={store} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Store Owner CTA — only show when stores exist */}
      {stores.length > 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-gray-600">
            Own a scratch and dent appliance store in {cityName}?
          </p>
          <Link
            href={getStoreSubmitUrl()}
            className="mt-2 inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
          >
            + Add your store to the directory
          </Link>
        </div>
      )}
    </>
  )
}
