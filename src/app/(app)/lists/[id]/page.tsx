import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const priorityStyles: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
}

export default async function ListDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const list = await prisma.list.findFirst({
    where: {
      id: params.id,
      ownerId: session.user.id,
    },
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!list) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <Link href="/lists" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Lists
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
      </div>

      {list.description && (
        <p className="text-gray-500 mb-6">{list.description}</p>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">{list.items.length} {list.items.length === 1 ? 'item' : 'items'}</p>
        <Link
          href={`/lists/${list.id}/add`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add item
        </Link>
      </div>

      {list.items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">No items yet. Add something to your list!</p>
          <Link
            href={`/lists/${list.id}/add`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Add first item
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.items.map((item) => (
            <li
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start hover:border-indigo-200 transition-colors"
            >
              {item.imageUrl && (
                <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.linkUrl ? (
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
                  {item.priority && (
                    <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${priorityStyles[item.priority]}`}>
                      {item.priority.charAt(0) + item.priority.slice(1).toLowerCase()}
                    </span>
                  )}
                </div>
                {item.price && (
                  <p className="text-sm font-semibold text-indigo-600 mt-1">
                    ${Number(item.price).toFixed(2)}
                  </p>
                )}
                {item.notes && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.notes}</p>
                )}
                {item.quantity > 1 && (
                  <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
