'use client'

/**
 * Deal Photo Gallery Component
 *
 * Shows deal photos with lightbox on click.
 */

import { useState } from 'react'

interface DealPhotoGalleryProps {
  photoPaths: string[]
  title: string
}

function getPhotoUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/deal-photos/${path}`
}

export function DealPhotoGallery({ photoPaths, title }: DealPhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (photoPaths.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm">No photos</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main photo */}
        <div
          className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
          onClick={() => setLightboxIndex(0)}
        >
          <img
            src={getPhotoUrl(photoPaths[0])}
            alt={title}
            className="h-full w-full object-cover hover:opacity-95 transition"
          />
        </div>

        {/* Thumbnails */}
        {photoPaths.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {photoPaths.map((path, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={getPhotoUrl(path)}
                  alt={`${title} photo ${i + 1}`}
                  className="h-full w-full object-cover hover:opacity-90 transition"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
          >
            &times;
          </button>

          {/* Prev/Next */}
          {photoPaths.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white text-4xl hover:text-gray-300 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((lightboxIndex - 1 + photoPaths.length) % photoPaths.length)
                }}
                aria-label="Previous photo"
              >
                &#8249;
              </button>
              <button
                className="absolute right-4 text-white text-4xl hover:text-gray-300 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((lightboxIndex + 1) % photoPaths.length)
                }}
                aria-label="Next photo"
              >
                &#8250;
              </button>
            </>
          )}

          <img
            src={getPhotoUrl(photoPaths[lightboxIndex])}
            alt={`${title} photo ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          <div className="absolute bottom-4 text-white text-sm">
            {lightboxIndex + 1} / {photoPaths.length}
          </div>
        </div>
      )}
    </>
  )
}
