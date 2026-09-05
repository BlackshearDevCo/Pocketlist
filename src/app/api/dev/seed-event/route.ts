import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALLOWED_EVENT_ID = 'cmtnrmuam0009aqdfx19yh49r'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.eventId !== ALLOWED_EVENT_ID) {
    return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })
  }

  const event = await prisma.event.findUnique({
    where: { id: ALLOWED_EVENT_ID },
    include: { members: true },
  })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const testUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@pocketlist.test' } },
  })

  const existingUserIds = new Set(event.members.map((m) => m.userId))
  const toAdd = testUsers.filter((u) => !existingUserIds.has(u.id))

  await prisma.eventMember.createMany({
    data: toAdd.map((u) => ({
      eventId: ALLOWED_EVENT_ID,
      userId: u.id,
      displayName: u.name ?? u.email,
      role: 'MEMBER',
    })),
  })

  return NextResponse.json({
    added: toAdd.map((u) => u.email),
    alreadyMember: testUsers
      .filter((u) => existingUserIds.has(u.id))
      .map((u) => u.email),
  })
}
