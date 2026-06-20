import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import JoinEventForm from './JoinEventForm'

export default async function JoinEventPage({ params }: { params: { token: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect(`/login?callbackUrl=/events/join/${params.token}`)

  const event = await prisma.event.findUnique({
    where: { inviteToken: params.token },
    include: { _count: { select: { members: true } } },
  })

  if (!event) notFound()

  const existing = await prisma.eventMember.findFirst({
    where: { eventId: event.id, userId: session.user.id },
  })

  if (existing) redirect(`/events/${event.id}`)

  return (
    <div className="max-w-md mx-auto pt-8">
      <div className="card p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-parchment flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-warm-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
            />
          </svg>
        </div>
        <h1 className="font-serif text-2xl text-warm-800 mb-2">{event.name}</h1>
        {event.date && (
          <p className="text-sm text-warm-400 mb-2">
            {new Date(event.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
        {event.description && (
          <p className="text-sm text-warm-500 mb-4">{event.description}</p>
        )}
        <p className="text-sm text-warm-400 mb-6">
          {event._count.members} {event._count.members === 1 ? 'member' : 'members'} · You&apos;ve
          been invited to join
        </p>
        <JoinEventForm eventId={event.id} />
      </div>
    </div>
  )
}
