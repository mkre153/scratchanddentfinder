/**
 * Nearby Stores API
 *
 * Phase 2: Returns stores near a given location.
 *
 * GET /api/stores/nearby?lat=40.7&lng=-73.9&radius=50&limit=20
 */

import { NextRequest, NextResponse } from 'next/server'
import { getNearbyStores } from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse and validate parameters
    const latStr = searchParams.get('lat')
    const lngStr = searchParams.get('lng')
    const radiusStr = searchParams.get('radius')
    const limitStr = searchParams.get('limit')

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lng' },
        { status: 400 }
      )
    }

    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid lat/lng values' },
        { status: 400 }
      )
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of valid range' },
        { status: 400 }
      )
    }

    // Parse optional parameters with defaults
    const radius = radiusStr ? Math.min(parseInt(radiusStr, 10), 100) : 50 // Cap at 100 miles
    const limit = limitStr ? Math.min(parseInt(limitStr, 10), 50) : 20 // Cap at 50 stores

    // Fetch nearby stores
    const stores = await getNearbyStores(lat, lng, radius, limit)

    return NextResponse.json({
      stores,
      count: stores.length,
      params: { lat, lng, radius, limit },
    })
  } catch (error) {
    console.error('Nearby stores error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nearby stores' },
      { status: 500 }
    )
  }
}
