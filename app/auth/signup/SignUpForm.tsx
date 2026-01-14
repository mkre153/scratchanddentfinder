'use client'

/**
 * Sign Up Form
 *
 * Client component using Supabase Auth UI.
 * Shows sign-up view by default with link to sign-in.
 */

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/browser'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SignUpFormProps {
  redirectTo: string
}

export function SignUpForm({ redirectTo }: SignUpFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [origin, setOrigin] = useState<string | null>(null)

  // Get window.location.origin on client-side only
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Send welcome email (fire and forget - don't block navigation)
        fetch('/api/email/welcome/', { method: 'POST' }).catch(() => {
          // Silently fail - welcome email is not critical
        })

        router.push(redirectTo)
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, redirectTo])

  // Don't render until we have the origin (prevents SSR window error)
  if (!origin) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#1d4ed8',
                brandAccent: '#1e40af',
              },
            },
          },
        }}
        providers={[]}
        redirectTo={`${origin}/auth/callback/?redirect=${encodeURIComponent(redirectTo)}`}
        view="sign_up"
        showLinks={true}
        localization={{
          variables: {
            sign_up: {
              email_label: 'Email',
              password_label: 'Password',
              button_label: 'Create Account',
              link_text: 'Already have an account? Sign in',
            },
            sign_in: {
              email_label: 'Email',
              password_label: 'Password',
              button_label: 'Sign In',
              link_text: "Don't have an account? Sign up",
            },
          },
        }}
      />
    </div>
  )
}
