'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-200 p-3">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={disabled ? 'Limit reached' : 'Ask about scratch & dent...'}
        disabled={disabled}
        className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-sage-300 focus:ring-1 focus:ring-sage-300 disabled:opacity-50"
        maxLength={500}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sage-500 text-white transition hover:bg-sage-600 disabled:opacity-40"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  )
}
