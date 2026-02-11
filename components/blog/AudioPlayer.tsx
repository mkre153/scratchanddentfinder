'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  title?: string
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const SPEEDS = [1, 1.5, 2] as const

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
    setPlaying(!playing)
  }, [playing])

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = pct * duration
    setCurrentTime(audio.currentTime)
  }, [duration])

  const cycleSpeed = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const idx = SPEEDS.indexOf(speed)
    const next = SPEEDS[(idx + 1) % SPEEDS.length]
    audio.playbackRate = next
    setSpeed(next)
  }, [speed])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-2xl">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title row */}
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-4 h-4 text-sage-600 flex-shrink-0" />
          <span className="text-xs font-medium text-sage-700 uppercase tracking-wide">
            Listen to this article
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-sage-600 hover:bg-sage-700 text-white transition-colors"
        >
          {playing ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        {/* Progress area */}
        <div className="flex-1 min-w-0">
          {/* Progress bar */}
          <div
            className="w-full h-2 bg-slate-200 rounded-full cursor-pointer group"
            onClick={seek}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            tabIndex={0}
          >
            <div
              className="h-full bg-sage-500 rounded-full transition-[width] duration-150 group-hover:bg-sage-600"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time display */}
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-500 tabular-nums">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Speed button */}
        <button
          onClick={cycleSpeed}
          className="flex-shrink-0 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors tabular-nums"
          aria-label={`Playback speed ${speed}x`}
        >
          {speed}x
        </button>
      </div>
    </div>
  )
}
