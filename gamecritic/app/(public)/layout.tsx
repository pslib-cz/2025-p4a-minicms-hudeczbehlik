import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-orange-600/30 bg-gradient-to-r from-black via-gray-900 to-black sticky top-0 z-50 shadow-lg">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-black tracking-tight text-orange-500 hover:text-orange-400 transition-colors">
            GameCritic
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/reviews" className="text-gray-300 hover:text-orange-400 transition-colors">Reviews</Link>
            <Link href="/games" className="text-gray-300 hover:text-orange-400 transition-colors">Games</Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-orange-400 transition-colors">Dashboard</Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
