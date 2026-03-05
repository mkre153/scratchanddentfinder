'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'homepage-newsletter' }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.alreadySubscribed ? 'You\'re already subscribed!' : 'You\'re in! Watch your inbox for weekly deals.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Try again.')
    }
  }

  return (
    <section className="py-12 bg-charcoal">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-sage-700 p-3">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Get Weekly Scratch &amp; Dent Deals
        </h2>
        <p className="text-gray-400 mb-6 text-sm">
          Savings tips, buying guides, and deal alerts — no spam, unsubscribe anytime.
        </p>

        {status === 'success' ? (
          <p className="text-sage-400 font-medium">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-lg bg-sage-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sage-700 disabled:opacity-60 transition-colors"
            >
              {status === 'loading' ? 'Joining…' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-2 text-sm text-red-400">{message}</p>
        )}
      </div>
    </section>
  )
}
