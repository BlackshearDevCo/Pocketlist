import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const list = await prisma.list.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  })
  if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })

  const last = await prisma.bundle.findFirst({
    where: { listId: params.id },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })

  const bundle = await prisma.bundle.create({
    data: { listId: params.id, name: name.trim(), sortOrder: (last?.sortOrder ?? -1) + 1 },
  })

  return NextResponse.json(bundle, { status: 201 })
}
