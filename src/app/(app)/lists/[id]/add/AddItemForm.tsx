'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  list: { id: string; name: string }
  initialValues?: {
    title?: string
    imageUrl?: string
    price?: string
    linkUrl?: string
    notes?: string
  }
}

const PRIORITIES = [
  { value: '', label: 'None' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
]

export default function AddItemForm({ list, initialValues }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialValues?.title || '')
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || '')
  const [price, setPrice] = useState(initialValues?.price || '')
  const [linkUrl, setLinkUrl] = useState(initialValues?.linkUrl || '')
  const [notes, setNotes] = useState(initialValues?.notes || '')
  const [priority, setPriority] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/lists/${list.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, imageUrl, price, linkUrl, notes, priority, quantity }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to add item.')
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

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href={`/lists/${list.id}`} className="text-xs text-warm-400 hover:text-warm-600 transition-colors">{list.name}</Link>
          <span className="text-warm-300">/</span>
        </div>
        <h1 className="page-title">Add item</h1>
      </div>

      <div className="card p-6">
        {error && (
          <div className="mb-4 rounded-xl bg-brand-subtle border border-brand-tint p-3 text-sm text-brand-dark">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="label">Title <span className="text-brand">*</span></label>
            <input id="title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="input" placeholder="e.g. Nike Air Max 90" autoFocus />
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
                  onChange={(e) => setPrice(e.target.value)}
                  className="input pl-8" placeholder="0.00" />
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
              {loading ? 'Adding…' : 'Add item'}
            </button>
            <Link href={`/lists/${list.id}`} className="btn-secondary flex-1 text-center">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
