'use client'

import { useState, useCallback, useRef } from 'react'
import type { ChatMessage } from './types'

const MAX_TURNS = 5

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const userCount = messages.filter((m) => m.role === 'user').length

  const send = useCallback(async (content: string) => {
    if (isStreaming || limitReached) return

    const userMessage: ChatMessage = { role: 'user', content }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setIsStreaming(true)

    // Check client-side limit
    const newUserCount = nextMessages.filter((m) => m.role === 'user').length
    if (newUserCount > MAX_TURNS) {
      setLimitReached(true)
      setIsStreaming(false)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      // Check if it's a JSON error response (limit reached server-side)
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        if (data.error === 'limit') {
          setLimitReached(true)
          setIsStreaming(false)
          return
        }
        throw new Error(data.error || 'Unknown error')
      }

      // Stream the response
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let assistantContent = ''

      // Add empty assistant message to start streaming into
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        assistantContent += decoder.decode(value, { stream: true })
        const current = assistantContent
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: current }
          return updated
        })
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again or email support@scratchanddentfinder.com.',
        },
      ])
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [messages, isStreaming, limitReached])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setIsStreaming(false)
    setLimitReached(false)
  }, [])

  return { messages, isStreaming, limitReached, userCount, send, reset }
}
