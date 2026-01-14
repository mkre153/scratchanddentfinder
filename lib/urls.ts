/**
 * URL Generation - Single Source of Truth
 *
 * ALL route strings MUST be generated through this file.
 * Gate 5 enforces this: no hardcoded routes in app/, components/, or other lib/ files.
 *
 * All URLs end with trailing slash for SEO parity (Gate 3).
 */

// =============================================================================
// Directory Routes
// =============================================================================

/**
 * Get homepage URL
 */
export function getHomepageUrl(): string {
  return '/'
}

/**
 * Get all states page URL
 */
export function getAllStatesUrl(): string {
  return '/scratch-and-dent-appliances/'
}

/**
 * Get state page URL
 */
export function getStateUrl(state: { slug: string }): string {
  return `/scratch-and-dent-appliances/${state.slug}/`
}

/**
 * Get city page URL
 */
export function getCityUrl(
  state: { slug: string },
  city: { slug: string }
): string {
  return `/scratch-and-dent-appliances/${state.slug}/${city.slug}/`
}

// =============================================================================
// Static Routes
// =============================================================================

/**
 * Get about page URL
 */
export function getAboutUrl(): string {
  return '/about/'
}

/**
 * Get contact page URL
 */
export function getContactUrl(): string {
  return '/contact/'
}

/**
 * Get advertise page URL
 */
export function getAdvertiseUrl(): string {
  return '/advertise-with-us/'
}

// =============================================================================
// Store Routes
// =============================================================================

/**
 * Get store submission page URL
 * Note: This is the ONLY allowed /stores/* route (Gate 1)
 */
export function getStoreSubmitUrl(): string {
  return '/stores/new/'
}

// =============================================================================
// Dashboard Routes
// =============================================================================

/**
 * Get dashboard URL
 */
export function getDashboardUrl(): string {
  return '/dashboard/'
}

/**
 * Get dashboard billing URL
 */
export function getDashboardBillingUrl(): string {
  return '/dashboard/billing/'
}

// =============================================================================
// API Routes
// =============================================================================

/**
 * Get leads API URL
 */
export function getLeadsApiUrl(): string {
  return '/api/leads/'
}

/**
 * Get Stripe webhook URL
 */
export function getStripeWebhookUrl(): string {
  return '/api/webhooks/stripe/'
}

/**
 * Get checkout API URL (Slice 13)
 */
export function getCheckoutApiUrl(): string {
  return '/api/checkout/'
}

/**
 * Get billing portal API URL (Slice 13)
 */
export function getBillingPortalApiUrl(): string {
  return '/api/billing-portal/'
}

// =============================================================================
// Auth Routes
// =============================================================================

/**
 * Get sign in URL
 */
export function getSignInUrl(): string {
  return '/auth/signin/'
}

/**
 * Get sign up URL
 */
export function getSignUpUrl(): string {
  return '/auth/signup/'
}

/**
 * Get auth callback URL (for OAuth redirect)
 */
export function getAuthCallbackUrl(): string {
  return '/auth/callback/'
}

/**
 * Get password reset URL
 */
export function getResetPasswordUrl(): string {
  return '/auth/reset-password/'
}

/**
 * Get update password URL (for password reset flow)
 */
export function getUpdatePasswordUrl(): string {
  return '/auth/update-password/'
}
