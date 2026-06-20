import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, date } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const event = await prisma.event.create({
    data: {
      organizerId: session.user.id,
      name: name.trim(),
      description: description?.trim() || null,
      date: date ? new Date(date) : null,
      members: {
        create: {
          userId: session.user.id,
          displayName: session.user.name || session.user.email || 'Organizer',
          role: 'ORGANIZER',
        },
      },
    },
  })

  return NextResponse.json(event, { status: 201 })
}
