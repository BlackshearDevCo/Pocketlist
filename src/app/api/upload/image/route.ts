import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image.' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 10MB.' }, { status: 400 })
  }

  try {
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `items/${session.user.id}/${Date.now()}.${ext}`
    const blob = await put(filename, file, { access: 'public' })
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('[upload/image]', error)
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
  }
}
