'use client'

/**
 * Admin Deal Actions (Client Component)
 *
 * Approve/reject buttons for flagged deals.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminDealActionsProps {
  dealId: string
}

export function AdminDealActions({ dealId }: AdminDealActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this deal?`)) return

    setLoading(true)
    try {
      const response = await fetch('/api/deals/moderate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, action }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to moderate deal')
        return
      }

      router.refresh()
    } catch {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={() => handleAction('approve')}
        disabled={loading}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Approve'}
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={loading}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Reject'}
      </button>
    </div>
  )
}
