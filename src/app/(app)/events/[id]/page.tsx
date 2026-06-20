import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import CopyButton from './CopyButton'
import AttachListForm from './AttachListForm'

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          attachedList: {
            include: { items: { orderBy: { sortOrder: 'asc' } } },
          },
        },
        orderBy: { role: 'desc' },
      },
    },
  })

  if (!event) notFound()

  const myMember = event.members.find((m) => m.userId === userId)
  if (!myMember) redirect('/events')

  const isOrganizer = myMember.role === 'ORGANIZER'

  const myLists = await prisma.list.findMany({
    where: { ownerId: userId },
    select: { id: true, name: true },
    orderBy: { updatedAt: 'desc' },
  })

  const baseUrl = process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const inviteUrl = `${baseUrl}/events/join/${event.inviteToken}`

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <Link href="/events" className="text-warm-400 hover:text-warm-600 transition-colors mt-1 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="page-title">{event.name}</h1>
            {isOrganizer && (
              <span className="text-xs font-medium bg-brand-subtle text-brand px-2 py-0.5 rounded-full">
                Organizer
              </span>
            )}
          </div>
          {event.date && (
            <p className="text-sm text-warm-400 mt-1">
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
          {event.description && (
            <p className="text-sm text-warm-600 mt-2">{event.description}</p>
          )}
        </div>
        {isOrganizer && (
          <Link href={`/events/${event.id}/edit`} className="btn-ghost text-sm px-3 py-1.5 flex-shrink-0">
            Edit
          </Link>
        )}
      </div>

      {/* Invite link */}
      <div className="card p-4 mb-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-warm-400 mb-0.5">Invite link</p>
            <p className="hidden sm:block text-sm text-warm-600 font-mono truncate">{inviteUrl}</p>
            <p className="sm:hidden text-sm text-warm-500">Share to invite others</p>
          </div>
          <CopyButton text={inviteUrl} />
        </div>
      </div>

      {/* My list selector */}
      <div className="mb-8">
        <h2 className="section-title mb-3">My List</h2>
        <div className="card p-4">
          <AttachListForm
            eventId={event.id}
            myLists={myLists}
            currentListId={myMember.attachedListId}
          />
          {myMember.attachedList && (
            <div className="mt-4 pt-4 border-t border-warm-100">
              <Link
                href={`/lists/${myMember.attachedList.id}`}
                className="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
              >
                View full list →
              </Link>
              {myMember.attachedList.items.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {myMember.attachedList.items.slice(0, 5).map((item) => (
                    <li key={item.id} className="text-sm text-warm-600 truncate">
                      • {item.title}
                    </li>
                  ))}
                  {myMember.attachedList.items.length > 5 && (
                    <li className="text-xs text-warm-400">
                      +{myMember.attachedList.items.length - 5} more
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-sm text-warm-400 mt-2">No items yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* All members */}
      <div>
        <h2 className="section-title mb-3">Members ({event.members.length})</h2>
        <div className="space-y-4">
          {event.members.map((member) => {
            const isMe = member.userId === userId
            return (
              <div key={member.id} className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-brand-tint flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-brand-dark">
                      {member.displayName[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-warm-800">{member.displayName}</p>
                      {isMe && (
                        <span className="text-xs text-warm-400">(You)</span>
                      )}
                      {member.role === 'ORGANIZER' && (
                        <span className="text-xs font-medium bg-brand-subtle text-brand px-1.5 py-0.5 rounded-full">
                          Organizer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {member.attachedList ? (
                  <>
                    <p className="text-xs font-medium text-warm-500 mb-2">
                      {member.attachedList.name}
                    </p>
                    {member.attachedList.items.length > 0 ? (
                      <ul className="space-y-2">
                        {member.attachedList.items.map((item) => (
                          <li key={item.id} className="flex items-center gap-3">
                            {item.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-warm-700 truncate">{item.title}</p>
                              {item.price && (
                                <p className="text-xs text-warm-400">
                                  ${Number(item.price).toFixed(2)}
                                </p>
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
                    ) : (
                      <p className="text-sm text-warm-400">No items yet</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-warm-400 italic">
                    {isMe ? 'Select a list above to share it here.' : 'No list attached yet'}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
