import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import EditItemForm from './EditItemForm'

export default async function EditItemPage({
  params,
}: {
  params: { id: string; itemId: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const item = await prisma.item.findFirst({
    where: {
      id: params.itemId,
      listId: params.id,
      list: { ownerId: session.user.id },
    },
    include: { list: { select: { id: true, name: true } } },
  })

  if (!item) notFound()

  return (
    <div className="max-w-lg mx-auto">
      <EditItemForm item={item} list={item.list} />
    </div>
  )
}
