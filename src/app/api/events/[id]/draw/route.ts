import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

// ─── helpers ────────────────────────────────────────────────────────────────

async function resolveSession(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      members: true,
      drawSessions: {
        include: {
          participants: true,
          exclusions: true,
          assignments: { include: { giver: true, receiver: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!event) return { event: null, member: null, drawSession: null }

  const member = event.members.find((m) => m.userId === userId) ?? null
  const drawSession = event.drawSessions[0] ?? null

  return { event, member, drawSession }
}

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Random derangement with exclusions.
 * Returns a map giverId → receiverId, or null if no valid assignment found.
 */
function computeAssignments(
  participantIds: string[],
  exclusions: { giverId: string; receiverId: string }[],
  maxAttempts = 200,
): Map<string, string> | null {
  const excluded = new Set(exclusions.map((e) => `${e.giverId}:${e.receiverId}`))

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const receivers = shuffle(participantIds)
    const assignment = new Map<string, string>()
    let valid = true

    for (let i = 0; i < participantIds.length; i++) {
      const giver = participantIds[i]
      const receiver = receivers[i]
      // No self-assignment, no excluded pair
      if (giver === receiver || excluded.has(`${giver}:${receiver}`)) {
        valid = false
        break
      }
      assignment.set(giver, receiver)
    }

    if (valid) return assignment
  }

  return null
}

// ─── GET — fetch current draw session ───────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { event, member, drawSession } = await resolveSession(params.id, session.user.id)
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  if (!drawSession) return NextResponse.json({ drawSession: null })

  const isOrganizer = member.role === 'ORGANIZER'

  const assignments = drawSession.assignments.map((a) => {
    const isMyAssignment = a.giver.userId === session.user!.id
    const revealed = isOrganizer || !!a.revealedAt
    return {
      id: a.id,
      giverId: a.giverId,
      giverName: a.giver.name,
      receiverId: revealed ? a.receiverId : null,
      receiverName: revealed ? a.receiver.name : null,
      revealedAt: a.revealedAt,
      isMyAssignment,
    }
  })

  return NextResponse.json({
    drawSession: {
      id: drawSession.id,
      drawnAt: drawSession.drawnAt,
      participants: drawSession.participants.map((p) => ({ id: p.id, name: p.name, userId: p.userId })),
      exclusions: isOrganizer
        ? drawSession.exclusions.map((e) => ({ id: e.id, giverId: e.giverId, receiverId: e.receiverId }))
        : [],
      assignments,
    },
  })
}

// ─── POST — create session or run draw ──────────────────────────────────────

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { event, member, drawSession } = await resolveSession(params.id, session.user.id)
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  if (!member || member.role !== 'ORGANIZER') {
    return NextResponse.json({ error: 'Organizer only' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const action: string = body.action ?? 'create'

  // ── action: create ──────────────────────────────────────────────────────
  if (action === 'create') {
    if (drawSession) {
      // Already exists — return it
      return NextResponse.json({ drawSessionId: drawSession.id })
    }

    // Sync participants from current EventMembers
    const newSession = await prisma.drawSession.create({
      data: {
        eventId: params.id,
        organizerId: session.user.id,
        participants: {
          create: event.members.map((m) => ({
            name: m.displayName,
            userId: m.userId ?? undefined,
          })),
        },
      },
    })

    return NextResponse.json({ drawSessionId: newSession.id })
  }

  // ── action: run ─────────────────────────────────────────────────────────
  if (action === 'run') {
    if (!drawSession) return NextResponse.json({ error: 'No draw session exists' }, { status: 400 })

    const participantIds = drawSession.participants.map((p) => p.id)
    if (participantIds.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 participants' }, { status: 400 })
    }

    const assignment = computeAssignments(participantIds, drawSession.exclusions)
    if (!assignment) {
      return NextResponse.json(
        { error: 'Could not find a valid assignment — exclusions may be too restrictive.' },
        { status: 422 },
      )
    }

    // Wipe old assignments, write new ones, mark drawnAt
    await prisma.$transaction([
      prisma.drawAssignment.deleteMany({ where: { drawSessionId: drawSession.id } }),
      prisma.drawAssignment.createMany({
        data: Array.from(assignment.entries()).map(([giverId, receiverId]) => ({
          drawSessionId: drawSession.id,
          giverId,
          receiverId,
        })),
      }),
      prisma.drawSession.update({
        where: { id: drawSession.id },
        data: { drawnAt: new Date() },
      }),
    ])

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

// ─── DELETE — reset draw session ────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { event, member, drawSession } = await resolveSession(params.id, session.user.id)
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  if (!member || member.role !== 'ORGANIZER') {
    return NextResponse.json({ error: 'Organizer only' }, { status: 403 })
  }

  if (!drawSession) return NextResponse.json({ success: true })

  await prisma.drawSession.delete({ where: { id: drawSession.id } })

  return NextResponse.json({ success: true })
}
