'use client'

import { useState, useCallback } from 'react'

type Participant = { id: string; name: string; userId: string | null }
type Exclusion = { id: string; giverId: string; receiverId: string }
type Assignment = {
  id: string
  giverId: string
  giverName: string
  receiverId: string | null
  receiverName: string | null
  revealedAt: string | null
  isMyAssignment: boolean
}

export type DrawData = {
  id: string
  drawnAt: string | null
  participants: Participant[]
  exclusions: Exclusion[]
  assignments: Assignment[]
}

interface Props {
  eventId: string
  initialDraw: DrawData | null
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export default function DrawManager({ eventId, initialDraw }: Props) {
  const [draw, setDraw] = useState<DrawData | null>(initialDraw)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    const data = await apiFetch(`/api/events/${eventId}/draw`)
    setDraw(data.drawSession)
  }, [eventId])

  async function handleAction(action: () => Promise<void>) {
    setError('')
    setLoading(true)
    try {
      await action()
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function createSession() {
    await handleAction(async () => {
      await apiFetch(`/api/events/${eventId}/draw`, {
        method: 'POST',
        body: JSON.stringify({ action: 'create' }),
      })
    })
  }

  async function runDraw() {
    await handleAction(async () => {
      await apiFetch(`/api/events/${eventId}/draw`, {
        method: 'POST',
        body: JSON.stringify({ action: 'run' }),
      })
    })
  }

  async function resetSession() {
    if (!confirm('Reset the draw? All assignments and exclusions will be deleted.')) return
    await handleAction(async () => {
      await apiFetch(`/api/events/${eventId}/draw`, { method: 'DELETE' })
    })
  }

  async function toggleExclusion(giverId: string, receiverId: string, currentlyExcluded: boolean) {
    await handleAction(async () => {
      if (currentlyExcluded) {
        const exclusion = draw?.exclusions.find(
          (e) => e.giverId === giverId && e.receiverId === receiverId,
        )
        if (!exclusion) return
        await apiFetch(`/api/events/${eventId}/draw/exclusions`, {
          method: 'DELETE',
          body: JSON.stringify({ exclusionId: exclusion.id }),
        })
      } else {
        await apiFetch(`/api/events/${eventId}/draw/exclusions`, {
          method: 'POST',
          body: JSON.stringify({ giverId, receiverId }),
        })
      }
    })
  }

  // ── Phase: no session ─────────────────────────────────────────────────────
  if (!draw) {
    return (
      <div className="card p-6 mb-8">
        <h2 className="section-title mb-1">Draw Names</h2>
        <p className="text-sm text-warm-400 mb-4">
          Assign each member a secret person to buy for. You can set exclusions before running the draw.
        </p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          onClick={createSession}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Setting up…' : 'Set Up Draw'}
        </button>
      </div>
    )
  }

  const isDrawn = !!draw.drawnAt

  // ── Phase: drawn ──────────────────────────────────────────────────────────
  if (isDrawn) {
    const revealedCount = draw.assignments.filter((a) => a.revealedAt).length
    const totalCount = draw.assignments.length

    return (
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title mb-0.5">Draw Names</h2>
            <p className="text-xs text-warm-400">
              Drawn {new Date(draw.drawnAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={runDraw}
              disabled={loading}
              className="text-sm font-medium text-warm-500 hover:text-warm-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-warm-100"
            >
              Redraw
            </button>
            <button
              onClick={resetSession}
              disabled={loading}
              className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Reset
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex items-center gap-3 py-3 px-4 bg-brand-subtle rounded-xl">
          <svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-brand-dark">Names have been drawn</p>
            <p className="text-xs text-warm-500">
              {revealedCount} of {totalCount} {totalCount === 1 ? 'member has' : 'members have'} revealed their pick
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          {draw.participants.map((p) => {
            const assignment = draw.assignments.find((a) => a.giverId === p.id)
            return (
              <div key={p.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-warm-700">{p.name}</span>
                <span className={`text-xs ${assignment?.revealedAt ? 'text-brand font-medium' : 'text-warm-300'}`}>
                  {assignment?.revealedAt ? 'revealed' : 'not yet'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Phase: session setup (exclusions) ─────────────────────────────────────
  const excludedPairs = new Set(draw.exclusions.map((e) => `${e.giverId}:${e.receiverId}`))

  return (
    <div className="card p-6 mb-8">
      <div className="flex items-center justify-between mb-1">
        <h2 className="section-title mb-0">Draw Names</h2>
        <button
          onClick={resetSession}
          disabled={loading}
          className="text-xs text-warm-400 hover:text-red-500 transition-colors"
        >
          Cancel
        </button>
      </div>
      <p className="text-sm text-warm-400 mb-5">
        Optionally mark pairs that shouldn't be matched, then run the draw.
      </p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="space-y-4 mb-6">
        {draw.participants.map((giver) => {
          const others = draw.participants.filter((p) => p.id !== giver.id)
          const giverExclusions = others.filter((r) =>
            excludedPairs.has(`${giver.id}:${r.id}`),
          )
          return (
            <div key={giver.id}>
              <p className="text-sm font-medium text-warm-700 mb-1.5">{giver.name}</p>
              <div className="flex flex-wrap gap-2">
                {others.map((receiver) => {
                  const excluded = excludedPairs.has(`${giver.id}:${receiver.id}`)
                  return (
                    <button
                      key={receiver.id}
                      onClick={() => toggleExclusion(giver.id, receiver.id, excluded)}
                      disabled={loading}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        excluded
                          ? 'bg-red-50 border-red-200 text-red-600 font-medium'
                          : 'bg-warm-50 border-warm-200 text-warm-500 hover:border-warm-300'
                      }`}
                    >
                      {excluded ? '✕ ' : ''}
                      {receiver.name}
                    </button>
                  )
                })}
              </div>
              {giverExclusions.length > 0 && (
                <p className="text-xs text-warm-400 mt-1">
                  Won't give to: {giverExclusions.map((p) => p.name).join(', ')}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={runDraw}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Drawing…' : 'Draw Names'}
      </button>
    </div>
  )
}
