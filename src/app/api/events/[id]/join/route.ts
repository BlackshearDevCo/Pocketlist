import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await prisma.eventMember.findFirst({
    where: { eventId: params.id, userId: session.user.id },
  })
  if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 })

  const member = await prisma.eventMember.create({
    data: {
      eventId: params.id,
      userId: session.user.id,
      displayName: session.user.name || session.user.email || 'Member',
      role: 'MEMBER',
    },
  })

  return NextResponse.json(member, { status: 201 })
}
