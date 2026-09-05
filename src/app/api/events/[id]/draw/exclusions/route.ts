import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

async function requireOrganizer(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      members: true,
      drawSessions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })
  if (!event) return { error: 'Event not found', status: 404, drawSession: null }
  const member = event.members.find((m) => m.userId === userId)
  if (!member || member.role !== 'ORGANIZER') {
    return { error: 'Organizer only', status: 403, drawSession: null }
  }
  const drawSession = event.drawSessions[0] ?? null
  if (!drawSession) return { error: 'No draw session exists', status: 400, drawSession: null }
  return { error: null, status: 200, drawSession }
}

// ─── POST — add exclusion ───────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error, status, drawSession } = await requireOrganizer(params.id, session.user.id)
  if (error || !drawSession) return NextResponse.json({ error }, { status })

  const body = await req.json().catch(() => ({}))
  const { giverId, receiverId } = body as { giverId?: string; receiverId?: string }

  if (!giverId || !receiverId) {
    return NextResponse.json({ error: 'giverId and receiverId required' }, { status: 400 })
  }
  if (giverId === receiverId) {
    return NextResponse.json({ error: 'giverId and receiverId must differ' }, { status: 400 })
  }

  // Validate both participants belong to this draw session
  const participantIds = new Set(
    (await prisma.drawParticipant.findMany({
      where: { drawSessionId: drawSession.id },
      select: { id: true },
    })).map((p) => p.id),
  )

  if (!participantIds.has(giverId) || !participantIds.has(receiverId)) {
    return NextResponse.json({ error: 'Participants not found in this draw session' }, { status: 400 })
  }

  // Skip if duplicate
  const existing = await prisma.drawExclusion.findFirst({
    where: { drawSessionId: drawSession.id, giverId, receiverId },
  })
  if (existing) {
    return NextResponse.json({ exclusion: { id: existing.id, giverId, receiverId } })
  }

  const exclusion = await prisma.drawExclusion.create({
    data: { drawSessionId: drawSession.id, giverId, receiverId },
  })

  return NextResponse.json({ exclusion: { id: exclusion.id, giverId, receiverId } })
}

// ─── DELETE — remove exclusion ──────────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error, status, drawSession } = await requireOrganizer(params.id, session.user.id)
  if (error || !drawSession) return NextResponse.json({ error }, { status })

  const body = await req.json().catch(() => ({}))
  const { exclusionId } = body as { exclusionId?: string }

  if (!exclusionId) return NextResponse.json({ error: 'exclusionId required' }, { status: 400 })

  // Verify it belongs to this draw session
  const exclusion = await prisma.drawExclusion.findFirst({
    where: { id: exclusionId, drawSessionId: drawSession.id },
  })
  if (!exclusion) return NextResponse.json({ error: 'Exclusion not found' }, { status: 404 })

  await prisma.drawExclusion.delete({ where: { id: exclusionId } })

  return NextResponse.json({ success: true })
}
