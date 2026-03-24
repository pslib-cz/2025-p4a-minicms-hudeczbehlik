import Link from "next/link";

import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <header className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome {session?.user?.name ?? "Reviewer"}.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/reviews" className="rounded-xl bg-white p-5 shadow">
          Manage Reviews
        </Link>
        <Link href="/dashboard/games/new" className="rounded-xl bg-white p-5 shadow">
          Add New Game
        </Link>
        <Link href="/dashboard/screenshots" className="rounded-xl bg-white p-5 shadow">
          Manage Screenshots
        </Link>
      </div>
    </div>
  );
}
