'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Metadata {
  title?: string
  image?: string
  description?: string
  price?: string
  url?: string
}

export default function SharePage() {
  const searchParams = useSearchParams()
  const sharedUrl = searchParams.get('url') || ''
  const sharedTitle = searchParams.get('title') || ''

  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(sharedTitle)
  const [imageUrl, setImageUrl] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [linkUrl, setLinkUrl] = useState(sharedUrl)

  useEffect(() => {
    if (!sharedUrl) return
    setLoading(true)
    fetch(`/api/share/metadata?url=${encodeURIComponent(sharedUrl)}`)
      .then((res) => res.json())
      .then((data: Metadata) => {
        setMetadata(data)
        if (data.title && !sharedTitle) setTitle(data.title)
        if (data.image) setImageUrl(data.image)
        if (data.price) setPrice(data.price)
      })
      .catch(() => setError('Could not load page metadata.'))
      .finally(() => setLoading(false))
  }, [sharedUrl, sharedTitle])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert('Item saved! (List selection coming soon)')
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="page-title mb-6">Add to List</h1>

      {loading && (
        <div className="card p-4 mb-4 flex items-center gap-3">
          <svg className="animate-spin h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-warm-500">Loading page info…</span>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-brand-subtle border border-brand-tint p-3 text-sm text-brand-dark">{error}</div>
      )}

      {metadata?.image && (
        <div className="mb-4 rounded-2xl overflow-hidden bg-parchment h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={metadata.image} alt="Product" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="input" placeholder="Item title" />
          </div>
          <div>
            <label className="label">Link</label>
            <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
              className="input" placeholder="https://…" />
          </div>
          <div>
            <label className="label">Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm">$</span>
              <input type="text" value={price} onChange={(e) => setPrice(e.target.value)}
                className="input pl-8" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="label">Image URL</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              className="input" placeholder="https://…" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={3} className="input resize-none" placeholder="Optional notes…" />
          </div>
          <button type="submit" className="btn-primary w-full">Save to List</button>
        </form>
      </div>
    </div>
  )
}
