import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      <nav className="bg-gradient-to-r from-black via-[#1a1a1a] to-black border-b border-orange-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex w-full flex-wrap justify-between items-center gap-6">
            <Link href="/" className="font-bold text-2xl text-orange-500 hover:text-orange-400 transition-colors">
              GameCritic
            </Link>
            <nav className="flex flex-row flex-wrap gap-2 md:gap-6">
              <Link href="/dashboard" className="nav-link py-2 px-4 text-gray-300 hover:text-orange-500 hover:bg-orange-500/10 rounded-md transition-all duration-200">
                Přehled
              </Link>
              <Link href="/dashboard/reviews" className="nav-link py-2 px-4 text-gray-300 hover:text-orange-500 hover:bg-orange-500/10 rounded-md transition-all duration-200">
                Recenze
              </Link>
              <Link href="/dashboard/games/new" className="nav-link py-2 px-4 text-gray-300 hover:text-orange-500 hover:bg-orange-500/10 rounded-md transition-all duration-200">
                Nová hra
              </Link>
              <Link href="/dashboard/screenshots" className="nav-link py-2 px-4 text-gray-300 hover:text-orange-500 hover:bg-orange-500/10 rounded-md transition-all duration-200">
                Screenshoty
              </Link>
              <Link href="/dashboard/critics/new" className="nav-link py-2 px-4 text-gray-300 hover:text-orange-500 hover:bg-orange-500/10 rounded-md transition-all duration-200">
                Přidat kritika
              </Link>
            </nav>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
