import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const priorityBadge: Record<string, string> = {
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
}

export default async function ListDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const list = await prisma.list.findFirst({
    where: { id: params.id, ownerId: session.user.id },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!list) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/lists" className="text-xs text-warm-400 hover:text-warm-600 transition-colors">Lists</Link>
            <span className="text-warm-300">/</span>
          </div>
          <h1 className="page-title">{list.name}</h1>
          {list.description && <p className="text-warm-400 text-sm mt-1">{list.description}</p>}
        </div>
        <Link href={`/lists/${list.id}/edit`} className="btn-ghost text-sm px-3 py-1.5 mt-1">
          Edit
        </Link>
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between mt-5 mb-4">
        <p className="text-sm text-warm-400">{list.items.length} {list.items.length === 1 ? 'item' : 'items'}</p>
        <Link href={`/lists/${list.id}/add`} className="btn-primary text-sm px-3 py-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add item
        </Link>
      </div>

      {list.items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-serif text-xl text-warm-700 mb-1">Nothing here yet</p>
          <p className="text-sm text-warm-400 mb-6">Add your first item to this list</p>
          <Link href={`/lists/${list.id}/add`} className="btn-primary">Add first item</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.items.map((item) => (
            <li key={item.id} className="card p-4 flex gap-4 items-start group hover:border-warm-300 transition-colors">
              {item.imageUrl && (
                <div className="flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden bg-parchment">
                  <Image src={item.imageUrl} alt={item.title} width={64} height={64}
                    className="h-full w-full object-cover" unoptimized />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-warm-800 leading-snug">
                    {item.linkUrl ? (
                      <a href={item.linkUrl} target="_blank" rel="noopener noreferrer"
                        className="hover:text-brand transition-colors">{item.title}</a>
                    ) : item.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.priority && (
                      <span className={priorityBadge[item.priority]}>
                        {item.priority.charAt(0) + item.priority.slice(1).toLowerCase()}
                      </span>
                    )}
                    <Link href={`/lists/${list.id}/items/${item.id}/edit`}
                      className="text-xs text-warm-400 hover:text-brand md:opacity-0 md:group-hover:opacity-100 transition-all px-2 py-1 -mx-2 -my-1">
                      Edit
                    </Link>
                  </div>
                </div>
                {item.price && (
                  <p className="text-sm font-semibold text-brand mt-1">${Number(item.price).toFixed(2)}</p>
                )}
                {item.notes && (
                  <p className="text-sm text-warm-400 mt-1 line-clamp-2">{item.notes}</p>
                )}
                {item.quantity > 1 && (
                  <p className="text-xs text-warm-300 mt-1">Qty: {item.quantity}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
