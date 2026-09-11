'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ListItem from './ListItem'

interface Item {
  id: string
  title: string
  imageUrl: string | null
  price: number | null
  linkUrl: string | null
  notes: string | null
  priority: string | null
  quantity: number
  purchased: boolean
}

interface Props {
  bundle: { id: string; name: string }
  items: Item[]
  listId: string
}

export default function BundleSection({ bundle, items, listId }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(bundle.name)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  async function saveName() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === bundle.name) { setName(bundle.name); setEditing(false); return }
    setSaving(true)
    try {
      await fetch(`/api/lists/${listId}/bundles/${bundle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      router.refresh()
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  async function deleteBundle() {
    if (!confirm(`Delete bundle "${bundle.name}"? Items in it won't be deleted.`)) return
    setDeleting(true)
    await fetch(`/api/lists/${listId}/bundles/${bundle.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 group/bundle">
        {editing ? (
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setName(bundle.name); setEditing(false) } }}
            disabled={saving}
            className="text-sm font-semibold text-warm-700 bg-transparent border-b border-brand outline-none min-w-0 flex-1 max-w-xs"
          />
        ) : (
          <>
            <h3 className="text-sm font-semibold text-warm-600 uppercase tracking-wide">{bundle.name}</h3>
            <button
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover/bundle:opacity-100 transition-opacity text-warm-300 hover:text-warm-500"
              aria-label="Rename bundle"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button
              onClick={deleteBundle}
              disabled={deleting}
              className="opacity-0 group-hover/bundle:opacity-100 transition-opacity text-warm-300 hover:text-red-400 disabled:opacity-30"
              aria-label="Delete bundle"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </>
        )}
        <span className="text-xs text-warm-300 ml-auto">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-warm-200 p-4 text-sm text-warm-300 text-center">
          No items yet — assign items to this bundle when adding or editing them
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <ListItem key={item.id} item={item} listId={listId} />
          ))}
        </ul>
      )}
    </div>
  )
}
