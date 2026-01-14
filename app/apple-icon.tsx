/**
 * Apple Touch Icon Generation
 *
 * Next.js 14 generates apple-touch-icon at build time from this file.
 * Slice 12: Presentation Parity
 */

import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: 'linear-gradient(135deg, #1d4ed8, #312e81)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        S
      </div>
    ),
    {
      ...size,
    }
  )
}
