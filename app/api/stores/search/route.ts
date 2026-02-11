/**
 * Store Search API Route
 *
 * Type-ahead search for stores by name.
 * Used by the deal post form to link deals to existing stores.
 *
 * GET /api/stores/search?q=query
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchStoresByName } from '@/lib/queries'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ stores: [] })
  }

  try {
    const stores = await searchStoresByName(query, 5)
    return NextResponse.json({ stores })
  } catch (error) {
    console.error('Store search error:', error)
    return NextResponse.json({ stores: [] })
  }
}
