'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Priority } from '@prisma/client'

interface Props {
  item: {
    id: string
    title: string
    imageUrl: string | null
    price: unknown
    linkUrl: string | null
    notes: string | null
    priority: Priority | null
    quantity: number
  }
  list: { id: string; name: string }
}

const PRIORITIES = [
  { value: '', label: 'None' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
]

export default function EditItemForm({ item, list }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(item.title)
  const [imageUrl, setImageUrl] = useState(item.imageUrl || '')
  const [price, setPrice] = useState(item.price ? String(item.price) : '')
  const [linkUrl, setLinkUrl] = useState(item.linkUrl || '')
  const [notes, setNotes] = useState(item.notes || '')
  const [priority, setPriority] = useState(item.priority || '')
  const [quantity, setQuantity] = useState(String(item.quantity))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/lists/${list.id}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, imageUrl, price, linkUrl, notes, priority, quantity }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update item.')
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
    if (!confirm('Delete this item?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/lists/${list.id}/items/${item.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push(`/lists/${list.id}`)
        router.refresh()
      } else {
        setError('Failed to delete item.')
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
        <h1 className="page-title">Edit item</h1>
      </div>

      <div className="card p-6 mb-4">
        {error && (
          <div className="mb-4 rounded-xl bg-brand-subtle border border-brand-tint p-3 text-sm text-brand-dark">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="label">Title <span className="text-brand">*</span></label>
            <input id="title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="linkUrl" className="label">Link</label>
            <input id="linkUrl" type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
              className="input" placeholder="https://…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="price" className="label">Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm">$</span>
                <input id="price" type="number" min="0" step="0.01" value={price}
                  onChange={(e) => setPrice(e.target.value)} className="input pl-8" placeholder="0.00" />
              </div>
            </div>
            <div>
              <label htmlFor="quantity" className="label">Quantity</label>
              <input id="quantity" type="number" min="1" value={quantity}
                onChange={(e) => setQuantity(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label htmlFor="priority" className="label">Priority</label>
            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}
              className="input bg-white">
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="imageUrl" className="label">Image URL</label>
            <input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              className="input" placeholder="https://…" />
          </div>
          <div>
            <label htmlFor="notes" className="label">Notes</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={3} className="input resize-none" placeholder="Size, color, preferences…" />
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
        <p className="text-sm text-warm-400 mb-4">Permanently delete this item from the list.</p>
        <button onClick={handleDelete} disabled={deleting}
          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">
          {deleting ? 'Deleting…' : 'Delete item'}
        </button>
      </div>
    </>
  )
}
