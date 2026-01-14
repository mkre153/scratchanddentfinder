/**
 * Supabase Browser Client
 *
 * Client-side Supabase client for use in React components.
 * Uses the anon key for row-level security.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
