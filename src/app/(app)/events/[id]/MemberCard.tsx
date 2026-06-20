'use client'

import { useState } from 'react'

interface Item {
  id: string
  title: string
  price: unknown
  imageUrl: string | null
  linkUrl: string | null
}

interface Props {
  member: {
    id: string
    displayName: string
    role: string
    attachedList: {
      id: string
      name: string
      items: Item[]
    } | null
  }
  isMe: boolean
}

export default function MemberCard({ member, isMe }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => member.attachedList && setOpen((o) => !o)}
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
          {member.attachedList ? (
            <p className="text-xs text-warm-400 mt-0.5 truncate">
              {member.attachedList.name} · {member.attachedList.items.length} {member.attachedList.items.length === 1 ? 'item' : 'items'}
            </p>
          ) : (
            <p className="text-xs text-warm-300 mt-0.5 italic">No list shared</p>
          )}
        </div>
        {member.attachedList && (
          <svg
            className={`w-4 h-4 text-warm-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>

      {open && member.attachedList && (
        <div className="border-t border-warm-100 px-4 pb-4 pt-3">
          {member.attachedList.items.length === 0 ? (
            <p className="text-sm text-warm-400">No items yet</p>
          ) : (
            <ul className="space-y-3">
              {member.attachedList.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-warm-700 truncate">{item.title}</p>
                    {item.price && (
                      <p className="text-xs text-warm-400">${Number(item.price).toFixed(2)}</p>
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
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
