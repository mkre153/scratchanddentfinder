/**
 * GoHighLevel API Client
 *
 * Singleton pattern for GHL API access.
 * Uses Private API Key authentication.
 */

const GHL_API_BASE_URL =
  process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com'
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID

/**
 * Check if GHL integration is configured
 */
export function isGHLConfigured(): boolean {
  return Boolean(GHL_API_KEY && GHL_LOCATION_ID)
}

/**
 * Get the configured location ID
 */
export function getLocationId(): string {
  if (!GHL_LOCATION_ID) {
    throw new Error('[GHL] GHL_LOCATION_ID environment variable is not set')
  }
  return GHL_LOCATION_ID
}

/**
 * Make an authenticated request to the GHL API
 *
 * @param endpoint - API endpoint (e.g., '/contacts/upsert')
 * @param options - Fetch options
 * @returns Response data or throws error
 */
export async function ghlFetch<T>(
  endpoint: string,
  options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: Record<string, unknown>
  }
): Promise<T> {
  if (!GHL_API_KEY) {
    throw new Error('[GHL] GHL_API_KEY environment variable is not set')
  }

  const url = `${GHL_API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[GHL] API error ${response.status}:`, errorText)
    throw new Error(`GHL API error: ${response.status} - ${errorText}`)
  }

  return response.json() as Promise<T>
}

/**
 * Make a GHL API request with retry logic
 *
 * @param endpoint - API endpoint
 * @param options - Fetch options
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @returns Response data or throws error after all retries
 */
export async function ghlFetchWithRetry<T>(
  endpoint: string,
  options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: Record<string, unknown>
  },
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ghlFetch<T>(endpoint, options)
    } catch (error) {
      lastError = error as Error
      console.warn(
        `[GHL] Attempt ${attempt}/${maxRetries} failed:`,
        lastError.message
      )

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
