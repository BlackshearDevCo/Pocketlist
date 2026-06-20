import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isMember = event.members.some((m) => m.userId === userId)
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json(event)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (event.organizerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, description, date } = await req.json()

  const updated = await prisma.event.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(date !== undefined && { date: date ? new Date(date) : null }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (event.organizerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.event.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
