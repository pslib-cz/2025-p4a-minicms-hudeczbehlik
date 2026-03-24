import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-black text-sky-700">
            GameCritic
          </Link>
          <div className="flex gap-4 text-sm font-medium text-slate-700">
            <Link href="/dashboard">Overview</Link>
            <Link href="/dashboard/reviews">Reviews</Link>
            <Link href="/dashboard/games/new">Add game</Link>
            <Link href="/dashboard/screenshots">Screenshots</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
