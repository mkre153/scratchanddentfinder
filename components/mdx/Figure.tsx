/**
 * Figure component for blog posts
 * Usage: images with caption + alt text (required)
 */

import Image from 'next/image'

interface FigureProps {
  src: string
  alt: string
  caption: string
  width?: number
  height?: number
}

export function Figure({
  src,
  alt,
  caption,
  width = 800,
  height = 400,
}: FigureProps) {
  // Validate required props at runtime
  if (!alt) {
    console.warn('Figure component: alt text is required for accessibility')
  }
  if (!caption) {
    console.warn('Figure component: caption is required')
  }

  return (
    <figure className="my-8">
      <div className="relative bg-slate-100 rounded-lg overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
        />
      </div>
      <figcaption className="mt-3 text-sm text-slate-500 text-center italic">
        {caption}
      </figcaption>
    </figure>
  )
}
