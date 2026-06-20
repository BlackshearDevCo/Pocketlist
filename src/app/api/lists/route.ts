import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lists = await prisma.list.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, name: true },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(lists)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, description } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const list = await prisma.list.create({
    data: {
      ownerId: session.user.id,
      name: name.trim(),
      description: description?.trim() || null,
    },
  })

  return NextResponse.json(list, { status: 201 })
}
