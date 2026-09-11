'use client'

import { useState } from 'react'

interface Item {
  id: string
  title: string
  price: number | null
  imageUrl: string | null
  linkUrl: string | null
  notes: string | null
  bundleId: string | null
}

interface Bundle {
  id: string
  name: string
}

interface Props {
  member: {
    id: string
    displayName: string
    role: string
    attachedList: {
      id: string
      name: string
      bundles: Bundle[]
      items: Item[]
    } | null
  }
  isMe: boolean
}

function bundleTotal(items: Item[]): string | null {
  const priced = items.filter((i) => i.price !== null)
  if (priced.length === 0) return null
  return priced.reduce((sum, i) => sum + (i.price ?? 0), 0).toFixed(2)
}

function ItemRow({ item }: { item: Item }) {
  return (
    <li className="flex items-center gap-3">
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-warm-700 break-words">{item.title}</p>
        {item.price !== null && (
          <p className="text-xs text-warm-400">${Number(item.price).toFixed(2)}</p>
        )}
        {item.notes && (
          <p className="text-xs text-warm-400 mt-0.5 break-words">{item.notes}</p>
        )}
      </div>
      {item.linkUrl && (
        <a
          href={item.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand hover:text-brand-hover flex-shrink-0 p-1"
          aria-label="View item"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      )}
    </li>
  )
}

export default function MemberCard({ member, isMe }: Props) {
  const [open, setOpen] = useState(false)

  const list = member.attachedList

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => list && setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full bg-brand-tint flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-brand-dark">
            {member.displayName[0]?.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-medium text-warm-800">{member.displayName}</p>
            {isMe && <span className="text-xs text-warm-400">(You)</span>}
            {member.role === 'ORGANIZER' && (
              <span className="text-xs font-medium bg-brand-subtle text-brand px-1.5 py-0.5 rounded-full">
                Organizer
              </span>
            )}
          </div>
          {list ? (
            <p className="text-xs text-warm-400 mt-0.5 truncate">
              {list.name} · {list.items.length} {list.items.length === 1 ? 'item' : 'items'}
            </p>
          ) : (
            <p className="text-xs text-warm-300 mt-0.5 italic">No list shared</p>
          )}
        </div>
        {list && (
          <svg
            className={`w-4 h-4 text-warm-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>

      {open && list && (
        <div className="border-t border-warm-100 px-4 pb-4 pt-3">
          {list.items.length === 0 ? (
            <p className="text-sm text-warm-400">No items yet</p>
          ) : (
            <div className="space-y-4">
              {/* Bundles */}
              {list.bundles.map((bundle) => {
                const bundleItems = list.items.filter((i) => i.bundleId === bundle.id)
                if (bundleItems.length === 0) return null
                const total = bundleTotal(bundleItems)
                return (
                  <div key={bundle.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-warm-500 uppercase tracking-wide">{bundle.name}</p>
                      {total && <p className="text-xs font-semibold text-warm-500">${total}</p>}
                    </div>
                    <ul className="space-y-3">
                      {bundleItems.map((item) => <ItemRow key={item.id} item={item} />)}
                    </ul>
                  </div>
                )
              })}

              {/* Unbundled items */}
              {(() => {
                const unbundled = list.items.filter((i) => !i.bundleId)
                if (unbundled.length === 0) return null
                return (
                  <div>
                    {list.bundles.length > 0 && (
                      <p className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2">Other items</p>
                    )}
                    <ul className="space-y-3">
                      {unbundled.map((item) => <ItemRow key={item.id} item={item} />)}
                    </ul>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
