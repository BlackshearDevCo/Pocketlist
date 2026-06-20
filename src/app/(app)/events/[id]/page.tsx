import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import CopyButton from './CopyButton'
import AttachListForm from './AttachListForm'
import MemberCard from './MemberCard'

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
            <div className="mt-3 pt-3 border-t border-warm-100 flex items-center justify-between">
              <p className="text-sm text-warm-600 truncate">
                {myMember.attachedList.name}
                <span className="text-warm-400 ml-1.5">· {myMember.attachedList.items.length} {myMember.attachedList.items.length === 1 ? 'item' : 'items'}</span>
              </p>
              <Link
                href={`/lists/${myMember.attachedList.id}`}
                className="text-sm font-medium text-brand hover:text-brand-hover transition-colors flex-shrink-0 ml-3"
              >
                View →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* All members */}
      <div>
        <h2 className="section-title mb-3">Members ({event.members.length})</h2>
        <div className="space-y-2">
          {event.members.map((member) => (
            <MemberCard
              key={member.id}
              member={{
                ...member,
                attachedList: member.attachedList ? {
                  ...member.attachedList,
                  items: member.attachedList.items.map((item) => ({
                    ...item,
                    price: item.price ? Number(item.price) : null,
                  })),
                } : null,
              }}
              isMe={member.userId === userId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
