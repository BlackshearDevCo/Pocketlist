import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listId } = await req.json()

  const member = await prisma.eventMember.findFirst({
    where: { eventId: params.id, userId: session.user.id },
  })
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  if (listId) {
    const list = await prisma.list.findFirst({
      where: { id: listId, ownerId: session.user.id },
    })
    if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 })
  }

  const updated = await prisma.eventMember.update({
    where: { id: member.id },
    data: { attachedListId: listId || null },
  })

  return NextResponse.json(updated)
}
