'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const priorityBadge: Record<string, string> = {
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
}

interface Props {
  item: {
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
  listId: string
}

export default function ListItem({ item, listId }: Props) {
  const [purchased, setPurchased] = useState(item.purchased)
  const [pending, setPending] = useState(false)

  async function toggle() {
    if (pending) return
    setPending(true)
    const next = !purchased
    setPurchased(next)
    try {
      await fetch(`/api/lists/${listId}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchased: next }),
      })
    } catch {
      setPurchased(!next)
    } finally {
      setPending(false)
    }
  }

  return (
    <li className={`card p-4 flex gap-4 items-center group transition-colors ${purchased ? 'bg-warm-50 border-warm-100' : 'hover:border-warm-300'}`}>
      <button
        onClick={toggle}
        disabled={pending}
        aria-label={purchased ? 'Mark as not gotten' : 'Mark as gotten'}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          purchased ? 'bg-brand border-brand' : 'border-warm-300 hover:border-brand'
        }`}
      >
        {purchased && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </button>

      {item.imageUrl && (
        <div className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden bg-parchment ${purchased ? 'opacity-40' : ''}`}>
          <Image src={item.imageUrl} alt={item.title} width={64} height={64}
            className="h-full w-full object-cover" unoptimized />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-medium leading-snug transition-colors ${purchased ? 'line-through text-warm-300' : 'text-warm-800'}`}>
            {item.linkUrl ? (
              <a href={item.linkUrl} target="_blank" rel="noopener noreferrer"
                className="hover:text-brand transition-colors">{item.title}</a>
            ) : item.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.priority && !purchased && (
              <span className={priorityBadge[item.priority]}>
                {item.priority.charAt(0) + item.priority.slice(1).toLowerCase()}
              </span>
            )}
            <Link href={`/lists/${listId}/items/${item.id}/edit`}
              className="text-xs text-warm-400 hover:text-brand md:opacity-0 md:group-hover:opacity-100 transition-all px-2 py-1 -mx-2 -my-1">
              Edit
            </Link>
          </div>
        </div>
        {item.price && (
          <p className={`text-sm font-semibold mt-1 ${purchased ? 'text-warm-300' : 'text-brand'}`}>
            ${item.price.toFixed(2)}
          </p>
        )}
        {item.notes && !purchased && (
          <p className="text-sm text-warm-400 mt-1 line-clamp-2">{item.notes}</p>
        )}
        {item.quantity > 1 && !purchased && (
          <p className="text-xs text-warm-300 mt-1">Qty: {item.quantity}</p>
        )}
      </div>
    </li>
  )
}
