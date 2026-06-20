'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type List = { id: string; name: string }

export default function AttachListForm({
  eventId,
  myLists,
  currentListId,
}: {
  eventId: string
  myLists: List[]
  currentListId: string | null | undefined
}) {
  const router = useRouter()
  const [listId, setListId] = useState(currentListId || '')
  const [saving, setSaving] = useState(false)

  async function handleChange(newListId: string) {
    setListId(newListId)
    setSaving(true)
    await fetch(`/api/events/${eventId}/attach-list`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId: newListId || null }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label mb-0" htmlFor="attach-list">
          Share a list with this event
        </label>
        {saving && <span className="text-xs text-warm-400">Saving…</span>}
      </div>
      <select
        id="attach-list"
        className="input"
        value={listId}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
      >
        <option value="">— No list selected —</option>
        {myLists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        ))}
      </select>
      {myLists.length === 0 && (
        <p className="text-xs text-warm-400 mt-1.5">
          <Link href="/lists/new" className="text-brand hover:underline">
            Create a list
          </Link>{' '}
          first to share it here.
        </p>
      )}
    </div>
  )
}
