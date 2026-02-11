/**
 * GA4 Custom Event Tracking
 *
 * Thin wrapper around gtag() for sending custom events to Google Analytics.
 * Only fires if gtag is loaded (i.e., GA4 component is mounted).
 */

type GtagParams = Record<string, string | number | boolean>

declare global {
  interface Window {
    gtag?: (...args: [string, string, GtagParams?]) => void
  }
}

export function trackEvent(name: string, params?: GtagParams): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params ?? {})
  }
}
