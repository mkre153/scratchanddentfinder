'use client'

import { useState, useRef } from 'react'
import { ChatToggleButton } from './ChatToggleButton'
import { ChatWindow } from './ChatWindow'
import { trackEvent } from '@/lib/analytics'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const hasTrackedOpen = useRef(false)

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next && !hasTrackedOpen.current) {
        trackEvent('chatbot_opened')
        hasTrackedOpen.current = true
      }
      return next
    })
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
      <ChatToggleButton isOpen={isOpen} onClick={handleToggle} />
    </div>
  )
}
