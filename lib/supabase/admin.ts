/**
 * Supabase Admin Client
 *
 * FACTORY BOUNDARY - This is the ONLY file that may import @supabase/supabase-js
 *
 * Gate 7 enforces this: no other files in app/, components/, or lib/ may
 * import from @supabase/supabase-js directly.
 *
 * All data access should go through lib/queries.ts, which imports from here.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

/**
 * Supabase admin client with service role key
 * Use this for server-side operations that need full access
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Create a Supabase client for use in Server Components
 * Uses the anon key for row-level security
 */
export function createServerClient() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  return createClient<Database>(supabaseUrl!, anonKey)
}

/**
 * Create a Supabase client for Server Components with cookie-based auth
 * Used for authenticated routes (dashboard, API routes, etc.)
 *
 * Slice 13: Stripe Integration
 */
export async function createAuthClient(cookieStore: {
  get: (name: string) => { value: string } | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: (name: string, value: string, options?: any) => void
}) {
  const { createServerClient: createSSRClient } = await import('@supabase/ssr')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  return createSSRClient<Database>(supabaseUrl!, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options) {
        try {
          cookieStore.set(name, value, options)
        } catch {
          // Ignore - cookies can't be set in Server Components
        }
      },
      remove(name: string, options) {
        try {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        } catch {
          // Ignore - cookies can't be set in Server Components
        }
      },
    },
  })
}
