'use client'

/**
 * Client Providers Wrapper
 *
 * Wraps children with all client-side context providers.
 * Used in app/layout.tsx to provide contexts to the entire app.
 */

import { UserLocationProvider } from '@/lib/contexts/UserLocationContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <UserLocationProvider>{children}</UserLocationProvider>
}
