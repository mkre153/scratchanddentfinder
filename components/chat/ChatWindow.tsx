'use client'

import { useEffect, useRef } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { SuggestedQuestions } from './SuggestedQuestions'
import { useChatStream } from '@/lib/chat/hooks'

interface ChatWindowProps {
  onClose: () => void
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const { messages, isStreaming, limitReached, send, reset } = useChatStream()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex h-[500px] w-[384px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl max-sm:h-[85vh] max-sm:w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-sage-500 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
            S&D
          </div>
          <div>
            <p className="text-sm font-medium text-white">Scratch & Dent Helper</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Reset conversation"
              title="Start over"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-6">
              <p className="text-center text-sm text-gray-500">
                Ask me anything about scratch and dent appliances.
              </p>
            </div>
            <SuggestedQuestions onSelect={send} />
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {limitReached && (
              <div className="rounded-lg bg-amber-50 p-3 text-center text-xs text-amber-800">
                Conversation limit reached. For more help, email{' '}
                <a href="mailto:support@scratchanddentfinder.com" className="underline">
                  support@scratchanddentfinder.com
                </a>
                .
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={send} disabled={isStreaming || limitReached} />
    </div>
  )
}
