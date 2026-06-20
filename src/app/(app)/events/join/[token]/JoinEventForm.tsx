'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function JoinEventForm({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  async function handleJoin() {
    setJoining(true)
    setError('')
    try {
      const res = await fetch(`/api/events/${eventId}/join`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to join')
      }
      router.push(`/events/${eventId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setJoining(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={handleJoin} disabled={joining} className="btn-primary w-full">
        {joining ? 'Joining…' : 'Join Event'}
      </button>
      <Link href="/events" className="btn-secondary w-full text-center block">
        Cancel
      </Link>
    </div>
  )
}
