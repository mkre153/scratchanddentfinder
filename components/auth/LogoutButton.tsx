'use client'

/**
 * Logout Button Component
 *
 * Client component that handles user sign-out via Supabase.
 * Redirects to homepage after successful logout.
 */

import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className = '' }: LogoutButtonProps) {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 ${className}`}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}
