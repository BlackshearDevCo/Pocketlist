import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import ListItem from './ListItem'
import BundleSection from './BundleSection'
import NewBundleButton from './NewBundleButton'

export default async function ListDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const list = await prisma.list.findFirst({
    where: { id: params.id, ownerId: session.user.id },
    include: {
      bundles: { orderBy: { sortOrder: 'asc' } },
      items: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!list) notFound()

  const toItem = (item: (typeof list.items)[0]) => ({
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    price: item.price ? Number(item.price) : null,
    linkUrl: item.linkUrl,
    notes: item.notes,
    priority: item.priority,
    quantity: item.quantity,
    purchased: item.purchased,
  })

  const bundledItemIds = new Set(list.items.filter((i) => i.bundleId).map((i) => i.id))
  const unbundledItems = list.items.filter((i) => !i.bundleId).map(toItem)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/lists" className="text-xs text-warm-400 hover:text-warm-600 transition-colors">Lists</Link>
            <span className="text-warm-300">/</span>
          </div>
          <h1 className="page-title">{list.name}</h1>
          {list.description && <p className="text-warm-400 text-sm mt-1.5">{list.description}</p>}
        </div>
        <Link href={`/lists/${list.id}/edit`} className="btn-ghost text-sm px-3 py-1.5 mt-1 flex-shrink-0">
          Edit
        </Link>
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <p className="text-sm text-warm-400">{list.items.length} {list.items.length === 1 ? 'item' : 'items'}</p>
        <div className="flex items-center gap-3">
          <NewBundleButton listId={list.id} />
          <Link href={`/lists/${list.id}/add`} className="btn-primary text-sm px-3 py-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add item
          </Link>
        </div>
      </div>

      {list.items.length === 0 && list.bundles.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-serif text-xl text-warm-700 mb-1">Nothing here yet</p>
          <p className="text-sm text-warm-400 mb-6">Add your first item to this list</p>
          <Link href={`/lists/${list.id}/add`} className="btn-primary">Add first item</Link>
        </div>
      ) : (
        <>
          {/* Bundles */}
          {list.bundles.map((bundle) => (
            <BundleSection
              key={bundle.id}
              bundle={bundle}
              listId={list.id}
              items={list.items.filter((i) => i.bundleId === bundle.id).map(toItem)}
            />
          ))}

          {/* Unbundled items */}
          {unbundledItems.length > 0 && (
            <ul className="space-y-3">
              {unbundledItems.map((item) => (
                <ListItem key={item.id} item={item} listId={list.id} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
