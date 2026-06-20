import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 bg-parchment">
      <div className="text-center max-w-sm w-full">
        <div className="mb-2 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center shadow-md">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="8" width="18" height="4" rx="1" />
              <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
              <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" />
            </svg>
          </div>
        </div>
        <h1 className="font-serif text-5xl text-warm-800 mt-6 mb-3">Pocketlist</h1>
        <p className="text-warm-500 text-base mb-10">Your personal wishlist, anywhere.</p>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="btn-primary text-base py-3">
            Sign in
          </Link>
          <Link href="/register" className="btn-secondary text-base py-3">
            Create account
          </Link>
        </div>
      </div>
    </main>
  )
}
