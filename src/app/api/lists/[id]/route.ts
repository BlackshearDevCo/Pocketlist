import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getOwnedList(listId: string, userId: string) {
  return prisma.list.findFirst({
    where: { id: listId, ownerId: userId },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const list = await getOwnedList(params.id, session.user.id)
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const { name, description } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    }

    const updated = await prisma.list.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[lists PATCH]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const list = await getOwnedList(params.id, session.user.id)
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    await prisma.list.delete({ where: { id: params.id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[lists DELETE]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
