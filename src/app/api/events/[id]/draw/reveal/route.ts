import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

// ─── POST — reveal calling user's assignment ────────────────────────────────

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      members: true,
      drawSessions: {
        include: {
          participants: true,
          assignments: { include: { receiver: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const member = event.members.find((m) => m.userId === session.user!.id)
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const drawSession = event.drawSessions[0] ?? null
  if (!drawSession) return NextResponse.json({ error: 'No draw session exists' }, { status: 400 })
  if (!drawSession.drawnAt) return NextResponse.json({ error: 'Draw has not been run yet' }, { status: 400 })

  // Find the participant record for this user
  const participant = drawSession.participants.find((p) => p.userId === session.user!.id)
  if (!participant) {
    return NextResponse.json({ error: 'You are not a participant in this draw' }, { status: 403 })
  }

  // Find this user's assignment (as giver)
  const assignment = drawSession.assignments.find((a) => a.giverId === participant.id)
  if (!assignment) {
    return NextResponse.json({ error: 'No assignment found for you' }, { status: 404 })
  }

  // Set revealedAt if not already set
  if (!assignment.revealedAt) {
    await prisma.drawAssignment.update({
      where: { id: assignment.id },
      data: { revealedAt: new Date() },
    })
  }

  return NextResponse.json({
    receiverId: assignment.receiverId,
    receiverName: assignment.receiver.name,
  })
}
