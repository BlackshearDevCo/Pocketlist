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
  const [pasteState, setPasteState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handlePasteUrl() {
    setPasteState('loading')
    try {
      const text = await navigator.clipboard.readText()
      const url = text.trim()
      if (!url.startsWith('http')) {
        setPasteState('error')
        return
      }
      setLinkUrl(url)
      const res = await fetch(`/api/share/metadata?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (data.title && !title) setTitle(data.title)
      if (data.image) setImageUrl(data.image)
      if (data.price) setPrice(data.price)
      setPasteState('done')
    } catch {
      setPasteState('error')
    }
  }

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

      {/* Paste URL shortcut */}
      <div className="card p-4 mb-4">
        <p className="text-xs text-warm-400 mb-2">Have a link copied? Fill in the form automatically.</p>
        <button
          type="button"
          onClick={handlePasteUrl}
          disabled={pasteState === 'loading'}
          className="btn-secondary w-full gap-2"
        >
          {pasteState === 'loading' ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Fetching…
            </>
          ) : pasteState === 'done' ? (
            <>
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Filled from link
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Paste URL
            </>
          )}
        </button>
        {pasteState === 'error' && (
          <p className="text-xs text-warm-400 mt-2 text-center">
            Couldn't read a URL from clipboard. Paste it manually in the Link field below.
          </p>
        )}
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
