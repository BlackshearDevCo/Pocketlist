import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getOwnedItem(itemId: string, listId: string, userId: string) {
  return prisma.item.findFirst({
    where: {
      id: itemId,
      listId,
      list: { ownerId: userId },
    },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const item = await getOwnedItem(params.itemId, params.id, session.user.id)
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const { title, imageUrl, price, linkUrl, notes, priority, quantity, purchased } = await req.json()

    if (purchased !== undefined && title === undefined) {
      const updated = await prisma.item.update({
        where: { id: params.itemId },
        data: { purchased },
      })
      return NextResponse.json(updated)
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
    }

    const updated = await prisma.item.update({
      where: { id: params.itemId },
      data: {
        title: title.trim(),
        imageUrl: imageUrl?.trim() || null,
        price: price ? parseFloat(price) : null,
        linkUrl: linkUrl?.trim() || null,
        notes: notes?.trim() || null,
        priority: priority || null,
        quantity: quantity ? parseInt(quantity) : 1,
        ...(purchased !== undefined && { purchased }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[items PATCH]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const item = await getOwnedItem(params.itemId, params.id, session.user.id)
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    await prisma.item.delete({ where: { id: params.itemId } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[items DELETE]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
