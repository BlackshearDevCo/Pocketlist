'use client'

import { useState } from 'react'

interface Props {
  itemId: string
  listId: string
  purchased: boolean
}

export default function PurchaseCheckbox({ itemId, listId, purchased: initial }: Props) {
  const [purchased, setPurchased] = useState(initial)
  const [pending, setPending] = useState(false)

  async function toggle() {
    if (pending) return
    setPending(true)
    const next = !purchased
    setPurchased(next)
    try {
      await fetch(`/api/lists/${listId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchased: next }),
      })
    } catch {
      setPurchased(!next)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label={purchased ? 'Mark as not gotten' : 'Mark as gotten'}
      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        purchased
          ? 'bg-brand border-brand'
          : 'border-warm-300 hover:border-brand'
      }`}
    >
      {purchased && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
    </button>
  )
}
