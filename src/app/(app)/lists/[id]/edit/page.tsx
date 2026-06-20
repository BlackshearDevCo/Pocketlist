import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import EditListForm from './EditListForm'

export default async function EditListPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const list = await prisma.list.findFirst({
    where: { id: params.id, ownerId: session.user.id },
    select: { id: true, name: true, description: true },
  })

  if (!list) notFound()

  return (
    <div className="max-w-lg mx-auto">
      <EditListForm list={list} />
    </div>
  )
}
