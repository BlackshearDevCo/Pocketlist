import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getOwnedBundle(bundleId: string, listId: string, userId: string) {
  return prisma.bundle.findFirst({
    where: { id: bundleId, listId, list: { ownerId: userId } },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; bundleId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bundle = await getOwnedBundle(params.bundleId, params.id, session.user.id)
  if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })

  const updated = await prisma.bundle.update({
    where: { id: params.bundleId },
    data: { name: name.trim() },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; bundleId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bundle = await getOwnedBundle(params.bundleId, params.id, session.user.id)
  if (!bundle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Items with this bundleId get bundleId set to null (onDelete: SetNull in schema)
  await prisma.bundle.delete({ where: { id: params.bundleId } })

  return new NextResponse(null, { status: 204 })
}
