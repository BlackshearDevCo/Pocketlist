import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const list = await prisma.list.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  })
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const { title, imageUrl, price, linkUrl, notes, priority, quantity } = await req.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
    }

    const lastItem = await prisma.item.findFirst({
      where: { listId: params.id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    })

    const item = await prisma.item.create({
      data: {
        listId: params.id,
        title: title.trim(),
        imageUrl: imageUrl?.trim() || null,
        price: price ? parseFloat(price) : null,
        linkUrl: linkUrl?.trim() || null,
        notes: notes?.trim() || null,
        priority: priority || null,
        quantity: quantity ? parseInt(quantity) : 1,
        sortOrder: (lastItem?.sortOrder ?? -1) + 1,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('[items POST]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
