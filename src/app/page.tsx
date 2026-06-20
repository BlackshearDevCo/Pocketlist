import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-indigo-600 mb-3">Pocketlist</h1>
          <p className="text-gray-500 text-lg">Your personal wishlist, anywhere.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  )
}
