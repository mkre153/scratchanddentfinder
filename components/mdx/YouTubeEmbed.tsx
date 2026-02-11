/**
 * YouTubeEmbed Component
 * Responsive 16:9 YouTube iframe embed for review pages.
 * Uses privacy-enhanced mode (youtube-nocookie.com).
 */

interface YouTubeEmbedProps {
  videoId: string
  title: string
  start?: number
}

export function YouTubeEmbed({ videoId, title, start }: YouTubeEmbedProps) {
  const src = `https://www.youtube-nocookie.com/embed/${videoId}${start ? `?start=${start}` : ''}`

  return (
    <div className="my-8 aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="h-full w-full border-0"
      />
    </div>
  )
}
