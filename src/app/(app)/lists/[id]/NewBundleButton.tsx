'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewBundleButton({ listId }: { listId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function create() {
    const trimmed = name.trim()
    if (!trimmed) { setOpen(false); setName(''); return }
    setSaving(true)
    try {
      await fetch(`/api/lists/${listId}/bundles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      setName('')
      setOpen(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-warm-400 hover:text-warm-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New bundle
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') create(); if (e.key === 'Escape') { setOpen(false); setName('') } }}
        placeholder="Bundle name…"
        disabled={saving}
        className="input py-1.5 text-sm h-auto flex-1 max-w-xs"
      />
      <button onClick={create} disabled={saving || !name.trim()} className="btn-primary text-sm py-1.5 px-3">
        {saving ? 'Creating…' : 'Create'}
      </button>
      <button onClick={() => { setOpen(false); setName('') }} className="text-sm text-warm-400 hover:text-warm-600">
        Cancel
      </button>
    </div>
  )
}
