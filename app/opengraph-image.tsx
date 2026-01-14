/**
 * Open Graph Image Generation
 *
 * Next.js 14 generates opengraph-image at build time from this file.
 * This serves as the default og:image for the entire site.
 * Slice 12: Presentation Parity
 */

import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/config'

export const runtime = 'edge'

export const alt = 'Scratch & Dent Locator - Find Discount Appliance Stores'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'linear-gradient(135deg, #1d4ed8 0%, #312e81 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: 40,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            marginBottom: 20,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 36,
            opacity: 0.9,
            textAlign: 'center',
          }}
        >
          Find Scratch and Dent Appliance Stores Near You
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 40,
            padding: '12px 32px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 8,
          }}
        >
          Save 30-70% on Quality Appliances
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
