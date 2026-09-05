'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  eventId: string
  drawn: boolean
  myAssignment: {
    revealedAt: string | null
    receiverName: string | null
    receiverListId: string | null
  } | null
}

export default function MyPickCard({ eventId, drawn, myAssignment }: Props) {
  const [revealed, setRevealed] = useState(!!myAssignment?.revealedAt)
  const [receiverName, setReceiverName] = useState(myAssignment?.receiverName ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Not drawn yet
  if (!drawn || !myAssignment) {
    return (
      <div className="card p-5 mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-warm-700">Secret pick</p>
          <p className="text-xs text-warm-400">The organizer hasn't run the draw yet.</p>
        </div>
      </div>
    )
  }

  async function handleReveal() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/events/${eventId}/draw/reveal`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reveal')
      setReceiverName(data.receiverName)
      setRevealed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Revealed state
  if (revealed && receiverName) {
    return (
      <div className="card p-5 mb-8">
        <p className="text-xs font-semibold text-brand uppercase tracking-wide mb-2">Your secret pick</p>
        <p className="text-2xl font-semibold text-warm-800 mb-3">{receiverName}</p>
        {myAssignment.receiverListId && (
          <Link
            href={`/lists/${myAssignment.receiverListId}`}
            className="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
          >
            View their list →
          </Link>
        )}
      </div>
    )
  }

  // Tap to reveal
  return (
    <div className="card p-5 mb-8">
      <p className="text-xs font-semibold text-brand uppercase tracking-wide mb-2">Your secret pick</p>
      <p className="text-sm text-warm-400 mb-4">
        Names have been drawn — tap below to find out who you got.
      </p>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button
        onClick={handleReveal}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Revealing…' : 'Reveal my pick'}
      </button>
    </div>
  )
}
