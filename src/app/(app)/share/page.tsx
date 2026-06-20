'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Metadata {
  title?: string
  image?: string
  description?: string
  price?: string
  url?: string
  error?: string
}

interface ListOption {
  id: string
  name: string
}

type Step = 'loading' | 'form' | 'saving' | 'saved' | 'error'

function ShareForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sharedUrl = searchParams.get('url') || ''
  const sharedTitle = searchParams.get('title') || searchParams.get('text') || ''

  const [step, setStep] = useState<Step>(sharedUrl ? 'loading' : 'form')
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [metaError, setMetaError] = useState('')

  const [title, setTitle] = useState(sharedTitle)
  const [imageUrl, setImageUrl] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [linkUrl, setLinkUrl] = useState(sharedUrl)
  const [selectedListId, setSelectedListId] = useState('')
  const [lists, setLists] = useState<ListOption[]>([])
  const [listsLoading, setListsLoading] = useState(true)
  const [saveError, setSaveError] = useState('')

  // Fetch OG metadata and user's lists in parallel
  useEffect(() => {
    const fetchLists = fetch('/api/lists')
      .then((r) => r.json())
      .then((data: ListOption[]) => {
        setLists(data)
        if (data.length > 0) setSelectedListId(data[0].id)
      })
      .catch(() => {})
      .finally(() => setListsLoading(false))

    if (!sharedUrl) {
      setStep('form')
      return
    }

    const fetchMeta = fetch(`/api/share/metadata?url=${encodeURIComponent(sharedUrl)}`)
      .then((r) => r.json())
      .then((data: Metadata) => {
        setMetadata(data)
        if (data.title && !sharedTitle) setTitle(data.title)
        if (data.image) setImageUrl(data.image)
        if (data.price) setPrice(data.price)
      })
      .catch(() => setMetaError('Could not load page info — you can fill in details manually.'))
      .finally(() => setStep('form'))

    Promise.all([fetchLists, fetchMeta])
  }, [sharedUrl, sharedTitle])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedListId) return
    setSaveError('')
    setStep('saving')

    try {
      const res = await fetch(`/api/lists/${selectedListId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          imageUrl: imageUrl.trim() || undefined,
          price: price || undefined,
          linkUrl: linkUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setSaveError(data.error || 'Failed to save item.')
        setStep('form')
      } else {
        setStep('saved')
      }
    } catch {
      setSaveError('Something went wrong.')
      setStep('form')
    }
  }

  const savedList = lists.find((l) => l.id === selectedListId)

  if (step === 'loading') {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <svg className="animate-spin h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-warm-400">Fetching page info…</p>
      </div>
    )
  }

  if (step === 'saved') {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-priority-low-bg flex items-center justify-center">
          <svg className="w-8 h-8 text-priority-low-text" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <h1 className="font-serif text-2xl text-warm-800 mb-1">Saved!</h1>
          <p className="text-warm-400 text-sm">
            Added to <span className="font-medium text-warm-600">{savedList?.name}</span>
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Link href={`/lists/${selectedListId}`} className="btn-primary w-full text-center">
            View list
          </Link>
          <button
            onClick={() => { setStep('form'); setSaveError(''); }}
            className="btn-secondary w-full"
          >
            Add another
          </button>
        </div>
        <p className="text-xs text-warm-300 mt-2">You can now switch back to your previous app.</p>
      </div>
    )
  }

  return (
    <div>
      {metaError && (
        <div className="mb-4 rounded-xl bg-warm-50 border border-warm-200 p-3 text-sm text-warm-500">
          {metaError}
        </div>
      )}

      {saveError && (
        <div className="mb-4 rounded-xl bg-brand-subtle border border-brand-tint p-3 text-sm text-brand-dark">
          {saveError}
        </div>
      )}

      {/* Product image preview */}
      {(metadata?.image || imageUrl) && (
        <div className="mb-4 rounded-2xl overflow-hidden bg-parchment h-44 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={metadata?.image || imageUrl}
            alt="Product preview"
            className="h-full w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        {/* List selector */}
        <div>
          <label className="label">Save to list</label>
          {listsLoading ? (
            <div className="input flex items-center gap-2 text-warm-400">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading lists…
            </div>
          ) : lists.length === 0 ? (
            <div className="text-sm text-warm-400">
              No lists yet.{' '}
              <Link href="/lists/new" className="text-brand font-medium">Create one first</Link>
            </div>
          ) : (
            <select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="input bg-white"
              required
            >
              {lists.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="border-t border-warm-100 pt-4 space-y-4">
          <div>
            <label className="label">Title <span className="text-brand">*</span></label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="input" placeholder="Item title" autoFocus />
          </div>

          <div>
            <label className="label">Link</label>
            <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
              className="input" placeholder="https://…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm">$</span>
                <input type="number" min="0" step="0.01" value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input pl-8" placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="label">Image URL</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                className="input" placeholder="https://…" />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={2} className="input resize-none" placeholder="Size, color, preferences…" />
          </div>
        </div>

        <button
          type="submit"
          disabled={step === 'saving' || listsLoading || lists.length === 0}
          className="btn-primary w-full"
        >
          {step === 'saving' ? 'Saving…' : 'Save to list'}
        </button>
      </form>
    </div>
  )
}

export default function SharePage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl text-warm-800">Add to Pocketlist</h1>
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <svg className="animate-spin h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      }>
        <ShareForm />
      </Suspense>
    </div>
  )
}
