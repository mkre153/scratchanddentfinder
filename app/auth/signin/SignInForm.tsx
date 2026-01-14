'use client'

/**
 * Sign In Form
 *
 * Client component using Supabase Auth UI.
 */

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/browser'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SignInFormProps {
  redirectTo: string
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push(redirectTo)
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, redirectTo])

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
        redirectTo={`${window.location.origin}/auth/callback/?redirect=${encodeURIComponent(redirectTo)}`}
        view="sign_in"
        showLinks={true}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email',
              password_label: 'Password',
              button_label: 'Sign In',
              link_text: "Don't have an account? Sign up",
            },
            sign_up: {
              email_label: 'Email',
              password_label: 'Password',
              button_label: 'Sign Up',
              link_text: 'Already have an account? Sign in',
            },
          },
        }}
      />
    </div>
  )
}
