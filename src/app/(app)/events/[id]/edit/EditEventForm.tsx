'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  event: { id: string; name: string; description: string | null; date: string | null }
}

export default function EditEventForm({ event }: Props) {
  const router = useRouter()
  const [name, setName] = useState(event.name)
  const [description, setDescription] = useState(event.description || '')
  const [date, setDate] = useState(
    event.date ? new Date(event.date).toISOString().split('T')[0] : ''
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, date: date || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update event.')
      } else {
        router.push(`/events/${event.id}`)
        router.refresh()
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this event? All members and attached lists will be unlinked. This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/events')
        router.refresh()
      } else {
        setError('Failed to delete event.')
        setDeleting(false)
      }
    } catch {
      setError('Something went wrong.')
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/events" className="text-xs text-warm-400 hover:text-warm-600 transition-colors">Events</Link>
          <span className="text-warm-300">/</span>
          <Link href={`/events/${event.id}`} className="text-xs text-warm-400 hover:text-warm-600 transition-colors">{event.name}</Link>
          <span className="text-warm-300">/</span>
        </div>
        <h1 className="page-title">Edit event</h1>
      </div>

      <div className="card p-6 mb-4">
        {error && (
          <div className="mb-4 rounded-xl bg-brand-subtle border border-brand-tint p-3 text-sm text-brand-dark">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">Event name <span className="text-brand">*</span></label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="date" className="label">Date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} className="input resize-none" placeholder="What's this event about?" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : 'Save changes'}
            </button>
            <Link href={`/events/${event.id}`} className="btn-secondary flex-1 text-center">Cancel</Link>
          </div>
        </form>
      </div>

      <div className="card p-6 border-red-100">
        <h2 className="text-sm font-semibold text-red-700 mb-1">Danger zone</h2>
        <p className="text-sm text-warm-400 mb-4">Permanently delete this event and remove all members.</p>
        <button onClick={handleDelete} disabled={deleting}
          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">
          {deleting ? 'Deleting…' : 'Delete event'}
        </button>
      </div>
    </>
  )
}
