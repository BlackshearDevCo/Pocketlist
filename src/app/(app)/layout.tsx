import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 min-h-0 pt-5 pb-4">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <span className="text-xl font-bold text-indigo-600">Pocketlist</span>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            <Link
              href="/lists"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              My Lists
            </Link>
            <Link
              href="/events"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Events
            </Link>
          </nav>
        </div>
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xs font-medium text-indigo-600">
                {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {session.user.name || session.user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-bold text-indigo-600">Pocketlist</span>
        <nav className="flex gap-4">
          <Link href="/lists" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Lists</Link>
          <Link href="/events" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Events</Link>
        </nav>
      </div>

      <div className="flex-1 md:pl-56">
        <main className="pt-14 md:pt-0 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
