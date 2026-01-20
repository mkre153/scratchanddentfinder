'use client'

/**
 * UserLocationContext — Ephemeral user location state
 *
 * Phase 3: Shares user location across components for distance display.
 *
 * ============================================================================
 * PRIVACY INVARIANT: User location is NEVER persisted.
 * ============================================================================
 * - No localStorage
 * - No sessionStorage
 * - No cookies
 * - No database writes
 * - No server transmission (except as query params for nearby search)
 *
 * Location lives only in React state and is cleared on page refresh.
 * This is intentional for user privacy and GDPR compliance.
 * ============================================================================
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface UserCoords {
  lat: number
  lng: number
}

export interface UserLocationContextValue {
  coords: UserCoords | null
  source: 'browser' | 'zip' | null
  setLocation: (coords: UserCoords, source: 'browser' | 'zip') => void
  clear: () => void
}

const UserLocationContext = createContext<UserLocationContextValue | null>(null)

interface UserLocationProviderProps {
  children: ReactNode
}

export function UserLocationProvider({ children }: UserLocationProviderProps) {
  // PRIVACY: State only - never persisted
  const [coords, setCoords] = useState<UserCoords | null>(null)
  const [source, setSource] = useState<'browser' | 'zip' | null>(null)

  const setLocation = useCallback((newCoords: UserCoords, newSource: 'browser' | 'zip') => {
    setCoords(newCoords)
    setSource(newSource)
  }, [])

  const clear = useCallback(() => {
    setCoords(null)
    setSource(null)
  }, [])

  return (
    <UserLocationContext.Provider value={{ coords, source, setLocation, clear }}>
      {children}
    </UserLocationContext.Provider>
  )
}

/**
 * Hook to access user location context.
 * Returns null if used outside of UserLocationProvider.
 */
export function useUserLocation(): UserLocationContextValue | null {
  return useContext(UserLocationContext)
}
