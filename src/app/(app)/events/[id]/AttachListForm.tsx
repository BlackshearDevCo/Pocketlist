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
      <label className="label" htmlFor="attach-list">
        Share a list with this event
      </label>
      <div className="relative">
        <select
          id="attach-list"
          className="input pr-8 appearance-none"
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
        {saving && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-warm-400">
            Saving…
          </span>
        )}
      </div>
      {myLists.length === 0 && (
        <p className="text-xs text-warm-400 mt-1">
          <Link href="/lists/new" className="text-brand hover:underline">
            Create a list
          </Link>{' '}
          first to share it here.
        </p>
      )}
    </div>
  )
}
