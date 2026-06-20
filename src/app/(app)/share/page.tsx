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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add to List</h1>

      {loading && (
        <div className="bg-indigo-50 rounded-lg p-4 mb-4 flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-indigo-700">Loading page info...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-lg p-3 mb-4 text-sm text-red-700">{error}</div>
      )}

      {metadata?.image && (
        <div className="mb-4 rounded-xl overflow-hidden bg-gray-100 h-48 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={metadata.image}
            alt="Product"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Item title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Optional notes..."
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          Save to List
        </button>
      </form>
    </div>
  )
}
