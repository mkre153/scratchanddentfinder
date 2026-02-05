'use client'

import { MessageCircle, X } from 'lucide-react'

interface ChatToggleButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function ChatToggleButton({ isOpen, onClick }: ChatToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-500 text-white shadow-lg transition hover:bg-sage-600 hover:shadow-xl active:scale-95"
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
    </button>
  )
}
