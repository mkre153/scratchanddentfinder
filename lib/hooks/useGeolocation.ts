'use client'

/**
 * Browser Geolocation Hook
 *
 * Phase 2: Provides user location via browser geolocation API.
 * Handles permission states and errors gracefully.
 *
 * PRIVACY: Location is NEVER persisted. Lives only in React state.
 */

import { useState, useCallback } from 'react'

export interface GeolocationCoords {
  lat: number
  lng: number
}

export interface GeolocationState {
  coords: GeolocationCoords | null
  error: GeolocationError | null
  loading: boolean
  source: 'browser' | 'zip' | null
}

export type GeolocationError =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED'

const initialState: GeolocationState = {
  coords: null,
  error: null,
  loading: false,
  source: null,
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(initialState)

  /**
   * Request browser geolocation.
   * Returns a promise that resolves with coords or rejects with error.
   */
  const requestLocation = useCallback(async (): Promise<GeolocationCoords> => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'NOT_SUPPORTED',
        loading: false,
      }))
      throw new Error('NOT_SUPPORTED')
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GeolocationCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setState({
            coords,
            error: null,
            loading: false,
            source: 'browser',
          })
          resolve(coords)
        },
        (error) => {
          let errorType: GeolocationError
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorType = 'PERMISSION_DENIED'
              break
            case error.POSITION_UNAVAILABLE:
              errorType = 'POSITION_UNAVAILABLE'
              break
            case error.TIMEOUT:
              errorType = 'TIMEOUT'
              break
            default:
              errorType = 'POSITION_UNAVAILABLE'
          }
          setState((prev) => ({
            ...prev,
            error: errorType,
            loading: false,
          }))
          reject(new Error(errorType))
        },
        {
          enableHighAccuracy: false, // Faster, sufficient for store finding
          timeout: 10000, // 10 second timeout
          maximumAge: 300000, // Cache for 5 minutes
        }
      )
    })
  }, [])

  /**
   * Set location from ZIP code lookup.
   * Used as fallback when browser geolocation is denied.
   */
  const setFromZip = useCallback((coords: GeolocationCoords) => {
    setState({
      coords,
      error: null,
      loading: false,
      source: 'zip',
    })
  }, [])

  /**
   * Clear location state.
   */
  const clear = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    ...state,
    requestLocation,
    setFromZip,
    clear,
  }
}
