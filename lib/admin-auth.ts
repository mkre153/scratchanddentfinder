/**
 * Admin Auth Utility - Slice 10: Operator Control
 *
 * Server-side admin role verification.
 * Uses admin_users table, NOT obscurity-based security.
 *
 * For development: Set ADMIN_BYPASS_USER_ID in .env.local to bypass auth
 * For production: Remove bypass and integrate with real auth
 */

import { isAdmin, getAdminRole } from '@/lib/queries'

/**
 * Get the current authenticated user ID
 *
 * TODO: Integrate with Supabase Auth when implemented
 * For now, uses optional bypass for development
 */
export async function getCurrentUserId(): Promise<string | null> {
  // Development bypass - set in .env.local for testing
  // NEVER set this in production
  const bypassUserId = process.env.ADMIN_BYPASS_USER_ID
  if (bypassUserId && process.env.NODE_ENV === 'development') {
    return bypassUserId
  }

  // TODO: Implement real session handling
  // const session = await getSession()
  // return session?.user?.id ?? null

  return null
}

/**
 * Check if the current user is an admin
 * Returns false if not authenticated or not an admin
 */
export async function requireAdmin(): Promise<{
  isAuthorized: boolean
  userId: string | null
  role: 'admin' | 'super_admin' | null
}> {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { isAuthorized: false, userId: null, role: null }
  }

  try {
    const authorized = await isAdmin(userId)
    if (!authorized) {
      return { isAuthorized: false, userId, role: null }
    }

    const role = await getAdminRole(userId)
    return { isAuthorized: true, userId, role }
  } catch {
    return { isAuthorized: false, userId, role: null }
  }
}

/**
 * Check if the current user is a super admin
 */
export async function requireSuperAdmin(): Promise<{
  isAuthorized: boolean
  userId: string | null
}> {
  const { isAuthorized, userId, role } = await requireAdmin()

  if (!isAuthorized || role !== 'super_admin') {
    return { isAuthorized: false, userId }
  }

  return { isAuthorized: true, userId }
}
