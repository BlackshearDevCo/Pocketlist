import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, description } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    }

    const list = await prisma.list.create({
      data: {
        ownerId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
      },
    })

    return NextResponse.json(list, { status: 201 })
  } catch (error) {
    console.error('[lists POST]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
