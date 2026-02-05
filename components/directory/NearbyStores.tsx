'use client'

/**
 * NearbyStores Component
 *
 * Phase 2: "Find Stores Near You" feature.
 * Uses browser geolocation with ZIP code fallback.
 *
 * PRIVACY: User location is NEVER persisted.
 */

import { useState } from 'react'
import { MapPin, Loader2, Navigation } from 'lucide-react'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { useUserLocation } from '@/lib/contexts/UserLocationContext'
import { getZipCoordinates, isValidZip } from '@/lib/utils/zip-geocoder'
import type { StoreWithDistance } from '@/lib/queries'
import { PhoneLink, DirectionsLink } from '@/components/cta'

interface NearbyStoresProps {
  variant: 'homepage' | 'state'
}

type ViewState = 'initial' | 'loading' | 'zip-input' | 'results' | 'error' | 'no-results'

export function NearbyStores({ variant }: NearbyStoresProps) {
  const geolocation = useGeolocation()
  const userLocation = useUserLocation()
  const [viewState, setViewState] = useState<ViewState>('initial')
  const [stores, setStores] = useState<StoreWithDistance[]>([])
  const [zipCode, setZipCode] = useState('')
  const [zipError, setZipError] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchNearbyStores = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `/api/stores/nearby?lat=${lat}&lng=${lng}&radius=50&limit=6`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stores')
      }

      if (data.stores.length === 0) {
        setViewState('no-results')
      } else {
        setStores(data.stores)
        setViewState('results')
      }
    } catch (err) {
      console.error('Fetch nearby stores error:', err)
      setErrorMessage('Unable to find stores. Please try again.')
      setViewState('error')
    }
  }

  const handleFindStores = async () => {
    setViewState('loading')
    setErrorMessage(null)

    try {
      const coords = await geolocation.requestLocation()
      // Sync with global context for DistanceBadge usage
      userLocation?.setLocation(coords, 'browser')
      await fetchNearbyStores(coords.lat, coords.lng)
    } catch (err) {
      // Geolocation failed - show ZIP input
      if (geolocation.error === 'PERMISSION_DENIED') {
        setViewState('zip-input')
      } else {
        setViewState('zip-input')
      }
    }
  }

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setZipError(null)

    if (!isValidZip(zipCode)) {
      setZipError('Please enter a valid 5-digit ZIP code')
      return
    }

    const coords = getZipCoordinates(zipCode)
    if (!coords) {
      setZipError('ZIP code not found. Try a nearby major city ZIP.')
      return
    }

    setViewState('loading')
    geolocation.setFromZip(coords)
    // Sync with global context for DistanceBadge usage
    userLocation?.setLocation(coords, 'zip')
    await fetchNearbyStores(coords.lat, coords.lng)
  }

  const handleTryAgain = () => {
    setViewState('initial')
    setStores([])
    setErrorMessage(null)
    geolocation.clear()
    userLocation?.clear()
  }

  // Initial state - show CTA button
  if (viewState === 'initial') {
    return (
      <section className="bg-sage-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-900">
              Discover scratch and dent appliance stores in your area
            </p>
            <button
              onClick={handleFindStores}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-gray-900 hover:bg-yellow-500"
            >
              <Navigation className="h-5 w-5" />
              Find Stores Near Me
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Loading state
  if (viewState === 'loading') {
    return (
      <section className="bg-sage-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
            <p className="mt-2 text-gray-600">Finding stores near you...</p>
          </div>
        </div>
      </section>
    )
  }

  // ZIP input fallback
  if (viewState === 'zip-input') {
    return (
      <section className="bg-sage-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <MapPin className="mx-auto h-8 w-8 text-gray-400" />
            <h2 className="mt-2 text-lg font-semibold text-gray-900">
              Enter Your ZIP Code
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              We couldn&apos;t access your location. Enter your ZIP code instead.
            </p>
            <form onSubmit={handleZipSubmit} className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="Enter ZIP"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  maxLength={5}
                />
                <button
                  type="submit"
                  className="rounded-lg bg-sage-600 px-4 py-2 font-semibold text-white hover:bg-sage-700"
                >
                  Search
                </button>
              </div>
              {zipError && (
                <p className="mt-2 text-sm text-red-600">{zipError}</p>
              )}
            </form>
            <button
              onClick={handleTryAgain}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Try location again
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (viewState === 'error') {
    return (
      <section className="bg-sage-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">{errorMessage}</p>
            <button
              onClick={handleTryAgain}
              className="mt-4 text-sage-600 hover:text-sage-700"
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    )
  }

  // No results state
  if (viewState === 'no-results') {
    return (
      <section className="bg-sage-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <MapPin className="mx-auto h-8 w-8 text-gray-400" />
            <h2 className="mt-2 text-lg font-semibold text-gray-900">
              No Stores Found Nearby
            </h2>
            <p className="mt-1 text-gray-600">
              We couldn&apos;t find stores within 50 miles of your location.
            </p>
            <button
              onClick={handleTryAgain}
              className="mt-4 text-sage-600 hover:text-sage-700"
            >
              Try a different location
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Results state
  return (
    <section className="bg-sage-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Stores Near You
            </h2>
            <p className="text-sm text-gray-600">
              {stores.length} store{stores.length !== 1 ? 's' : ''} within 50 miles
              {geolocation.source === 'zip' && ` of ${zipCode}`}
            </p>
          </div>
          <button
            onClick={handleTryAgain}
            className="text-sm text-sage-600 hover:text-sage-700"
          >
            Change location
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <article
              key={store.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{store.name}</h3>
                <span className="rounded-full bg-sage-100 px-2 py-1 text-xs font-medium text-sage-700">
                  {store.distance.toFixed(1)} mi
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{store.address}</p>
              <div className="mt-3 flex gap-2">
                {store.phone && (
                  <PhoneLink
                    phone={store.phone}
                    storeId={store.id}
                    className="flex-1 rounded bg-sage-600 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-sage-700"
                  />
                )}
                {store.lat && store.lng && (
                  <DirectionsLink
                    address={store.address}
                    storeId={store.id}
                    className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
