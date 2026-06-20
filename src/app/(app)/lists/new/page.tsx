'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewListPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create list.')
      } else {
        router.push(`/lists/${data.id}`)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/lists" className="text-xs text-warm-400 hover:text-warm-600 transition-colors">Lists</Link>
          <span className="text-warm-300">/</span>
        </div>
        <h1 className="page-title">New list</h1>
      </div>

      <div className="card p-6">
        {error && (
          <div className="mb-4 rounded-xl bg-brand-subtle border border-brand-tint p-3 text-sm text-brand-dark">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">List name <span className="text-brand">*</span></label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="input" placeholder="e.g. Birthday wishlist" autoFocus />
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} className="input resize-none" placeholder="Optional description…" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating…' : 'Create list'}
            </button>
            <Link href="/lists" className="btn-secondary flex-1 text-center">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
