'use client'

/**
 * Deal Photo Upload Component
 *
 * Drag-drop + file picker with client-side compression.
 * Uploads directly to Supabase Storage via signed URLs.
 */

import { useState, useRef, useCallback } from 'react'

interface DealPhotoUploadProps {
  dealId: string | null
  photoPaths: string[]
  onPhotosChange: (paths: string[]) => void
}

const MAX_PHOTOS = 4
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Compress image client-side using Canvas API
 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const maxWidth = 1200
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas not supported'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Compression failed'))
        },
        'image/jpeg',
        0.8
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

export function DealPhotoUpload({
  dealId,
  photoPaths,
  onPhotosChange,
}: DealPhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)

      if (photoPaths.length + fileArray.length > MAX_PHOTOS) {
        setError(`Maximum ${MAX_PHOTOS} photos allowed`)
        return
      }

      // Validate
      for (const file of fileArray) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError('Only JPEG, PNG, and WebP images are allowed')
          return
        }
        if (file.size > MAX_FILE_SIZE) {
          setError('Each photo must be under 5MB')
          return
        }
      }

      setError(null)
      setUploading(true)

      try {
        // Compress all images
        const compressed = await Promise.all(
          fileArray.map((file) => compressImage(file))
        )

        // Create preview URLs
        const newPreviews = compressed.map((blob) => URL.createObjectURL(blob))
        setPreviews((prev) => [...prev, ...newPreviews])

        if (!dealId) {
          // No deal ID yet — store previews, paths will be set after deal creation
          // For now just store preview state; actual upload happens on form submit
          setUploading(false)
          return
        }

        // Get signed upload URLs
        const urlResponse = await fetch('/api/deals/photos/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dealId,
            files: fileArray.map((f, i) => ({
              name: f.name,
              type: 'image/jpeg', // After compression
              size: compressed[i].size,
            })),
          }),
        })

        if (!urlResponse.ok) {
          const data = await urlResponse.json()
          throw new Error(data.error || 'Failed to get upload URLs')
        }

        const { uploadUrls } = await urlResponse.json()

        // Upload each file to Supabase Storage
        const newPaths: string[] = []
        for (let i = 0; i < compressed.length; i++) {
          const { signedUrl, path, token } = uploadUrls[i]

          const uploadRes = await fetch(signedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'image/jpeg',
              'x-upsert': 'true',
            },
            body: compressed[i],
          })

          if (!uploadRes.ok) {
            throw new Error(`Failed to upload photo ${i + 1}`)
          }

          newPaths.push(path)
        }

        onPhotosChange([...photoPaths, ...newPaths])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        // Remove failed previews
        setPreviews((prev) => prev.slice(0, photoPaths.length))
      } finally {
        setUploading(false)
      }
    },
    [dealId, photoPaths, onPhotosChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleRemove = (index: number) => {
    const newPaths = photoPaths.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    onPhotosChange(newPaths)
    setPreviews(newPreviews)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const getPhotoUrl = (path: string) =>
    `${supabaseUrl}/storage/v1/object/public/deal-photos/${path}`

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Photos <span className="text-gray-400">(recommended, up to {MAX_PHOTOS})</span>
      </label>

      {/* Drop zone */}
      {photoPaths.length < MAX_PHOTOS && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <svg
            className="mx-auto h-10 w-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            {uploading ? 'Uploading...' : 'Drag & drop photos or click to browse'}
          </p>
          <p className="mt-1 text-xs text-gray-400">JPEG, PNG, WebP. Max 5MB each.</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files)
              e.target.value = '' // Reset for same file re-upload
            }}
          />
        </div>
      )}

      {/* Preview grid */}
      {(photoPaths.length > 0 || previews.length > 0) && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(photoPaths.length > 0 ? photoPaths : previews).map((item, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={photoPaths.length > 0 ? getPhotoUrl(item) : item}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                aria-label={`Remove photo ${i + 1}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {uploading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Uploading photos...
        </div>
      )}
    </div>
  )
}
