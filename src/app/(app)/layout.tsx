import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const initial = (session.user.name?.[0] || session.user.email?.[0] || '?').toUpperCase()
  const displayName = session.user.name || session.user.email || ''

  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-warm-200">
        <div className="flex flex-col flex-1 min-h-0 p-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8 px-1">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="18" height="4" rx="1" />
                <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" />
              </svg>
            </div>
            <span className="font-serif text-xl text-warm-800">Pocketlist</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5">
            <Link href="/lists" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-600 hover:bg-parchment hover:text-warm-800 transition-colors">
              <svg className="w-4 h-4 text-warm-400 group-hover:text-warm-600 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              My Lists
            </Link>
            <Link href="/events" className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-600 hover:bg-parchment hover:text-warm-800 transition-colors">
              <svg className="w-4 h-4 text-warm-400 group-hover:text-warm-600 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Events
            </Link>
          </nav>
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-warm-100">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-brand-tint flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-brand-dark">{initial}</span>
            </div>
            <p className="text-sm font-medium text-warm-700 truncate">{displayName}</p>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-warm-200 px-4 py-3 flex items-center justify-between">
        <span className="font-serif text-lg text-warm-800">Pocketlist</span>
        <nav className="flex gap-1">
          <Link href="/lists" className="px-3 py-1.5 rounded-lg text-sm font-medium text-warm-600 hover:bg-parchment transition-colors">Lists</Link>
          <Link href="/events" className="px-3 py-1.5 rounded-lg text-sm font-medium text-warm-600 hover:bg-parchment transition-colors">Events</Link>
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 md:pl-60">
        <main className="pt-20 md:pt-0 px-4 py-6 md:p-8 pb-10">
          {children}
        </main>
      </div>
    </div>
  )
}
