import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function EventsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const events = await prisma.event.findMany({
    where: {
      OR: [
        { organizerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      _count: { select: { members: true } },
      members: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title">Events</h1>
        <Link href="/events/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-parchment flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-warm-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
          </div>
          <p className="font-serif text-xl text-warm-700 mb-1">No events yet</p>
          <p className="text-sm text-warm-400 mb-6">
            Create an event to coordinate wishlists with friends and family
          </p>
          <Link href="/events/new" className="btn-primary">
            Create an event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => {
            const myRole = event.members[0]?.role
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="card p-5 block hover:border-brand-light hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold text-warm-800 group-hover:text-brand transition-colors text-base">
                    {event.name}
                  </h2>
                  {myRole === 'ORGANIZER' && (
                    <span className="text-xs font-medium bg-brand-subtle text-brand px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                      Organizer
                    </span>
                  )}
                </div>
                {event.date && (
                  <p className="text-sm text-warm-500 mb-2">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
                <p className="text-xs text-warm-300 mt-auto">
                  {event._count.members} {event._count.members === 1 ? 'member' : 'members'}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
