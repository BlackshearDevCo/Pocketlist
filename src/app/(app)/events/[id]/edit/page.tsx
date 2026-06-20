import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import EditEventForm from './EditEventForm'

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, description: true, date: true, organizerId: true },
  })

  if (!event) notFound()
  if (event.organizerId !== session.user.id) redirect(`/events/${params.id}`)

  return (
    <div className="max-w-lg mx-auto">
      <EditEventForm
        event={{
          id: event.id,
          name: event.name,
          description: event.description,
          date: event.date?.toISOString() ?? null,
        }}
      />
    </div>
  )
}
