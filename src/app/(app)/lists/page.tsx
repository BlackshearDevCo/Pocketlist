import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ListsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const lists = await prisma.list.findMany({
    where: { ownerId: session.user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title">My Lists</h1>
        <Link href="/lists/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New list
        </Link>
      </div>

      {lists.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-parchment flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-warm-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <p className="font-serif text-xl text-warm-700 mb-1">No lists yet</p>
          <p className="text-sm text-warm-400 mb-6">Create your first wishlist to get started</p>
          <Link href="/lists/new" className="btn-primary">
            Create a list
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="card p-5 block hover:border-brand-light hover:shadow-md transition-all group"
            >
              <h2 className="font-semibold text-warm-800 group-hover:text-brand transition-colors mb-1 text-base">
                {list.name}
              </h2>
              {list.description && (
                <p className="text-sm text-warm-400 line-clamp-2 mb-3">{list.description}</p>
              )}
              <p className="text-xs text-warm-300 mt-auto">
                {list._count.items} {list._count.items === 1 ? 'item' : 'items'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
