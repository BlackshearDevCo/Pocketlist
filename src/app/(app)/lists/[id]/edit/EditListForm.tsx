'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  list: { id: string; name: string; description: string | null }
}

export default function EditListForm({ list }: Props) {
  const router = useRouter()
  const [name, setName] = useState(list.name)
  const [description, setDescription] = useState(list.description || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update list.')
      } else {
        router.push(`/lists/${list.id}`)
        router.refresh()
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this list and all its items? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/lists/${list.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/lists')
        router.refresh()
      } else {
        setError('Failed to delete list.')
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
        <div className="flex items-center gap-2 mb-1">
          <Link href={`/lists/${list.id}`} className="text-xs text-warm-400 hover:text-warm-600 transition-colors">{list.name}</Link>
          <span className="text-warm-300">/</span>
        </div>
        <h1 className="page-title">Edit list</h1>
      </div>

      <div className="card p-6 mb-4">
        {error && (
          <div className="mb-4 rounded-xl bg-brand-subtle border border-brand-tint p-3 text-sm text-brand-dark">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">List name <span className="text-brand">*</span></label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} className="input resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : 'Save changes'}
            </button>
            <Link href={`/lists/${list.id}`} className="btn-secondary flex-1 text-center">Cancel</Link>
          </div>
        </form>
      </div>

      <div className="card p-6 border-red-100">
        <h2 className="text-sm font-semibold text-red-700 mb-1">Danger zone</h2>
        <p className="text-sm text-warm-400 mb-4">Permanently delete this list and all its items.</p>
        <button onClick={handleDelete} disabled={deleting}
          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">
          {deleting ? 'Deleting…' : 'Delete list'}
        </button>
      </div>
    </>
  )
}
