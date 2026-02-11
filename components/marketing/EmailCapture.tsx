'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface EmailCaptureProps {
  source: string
}

export function EmailCapture({ source }: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        return
      }

      setStatus(data.alreadySubscribed ? 'duplicate' : 'success')
      if (!data.alreadySubscribed) {
        setEmail('')
        trackEvent('newsletter_signup', { source })
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-green-700">
        <Bell className="h-4 w-4" />
        You&apos;re subscribed! We&apos;ll keep you updated.
      </p>
    )
  }

  if (status === 'duplicate') {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-gray-600">
        <Bell className="h-4 w-4" />
        You&apos;re already subscribed!
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (status === 'error') setStatus('idle')
        }}
        className="w-44 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-sage-500 focus:outline-none focus:ring-1 focus:ring-sage-500"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <Bell className="h-4 w-4" />
        {status === 'loading' ? 'Saving...' : 'Get Updates'}
      </button>
      {status === 'error' && (
        <span className="text-xs text-red-600">Try again</span>
      )}
    </form>
  )
}
