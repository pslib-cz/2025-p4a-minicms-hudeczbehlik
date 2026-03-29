import Link from "next/link";

import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <div className="mb-6 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-orange-100">
          Vítejte, {session?.user?.name ?? "recenzente"}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <h3 className="text-lg font-bold text-orange-400 mb-2">Recenze</h3>
          <p className="text-gray-400 text-sm mb-4">Správa vlastních recenzí.</p>
          <Link href="/dashboard/reviews" className="inline-block font-semibold text-orange-400 hover:text-orange-300 transition-colors">
            Otevřít →
          </Link>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <h3 className="text-lg font-bold text-orange-400 mb-2">Nová hra</h3>
          <p className="text-gray-400 text-sm mb-4">Přidat záznam hry a tagy.</p>
          <Link href="/dashboard/games/new" className="inline-block font-semibold text-orange-400 hover:text-orange-300 transition-colors">
            Otevřít →
          </Link>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <h3 className="text-lg font-bold text-orange-400 mb-2">Screenshoty</h3>
          <p className="text-gray-400 text-sm mb-4">Galerie k hrám.</p>
          <Link href="/dashboard/screenshots" className="inline-block font-semibold text-orange-400 hover:text-orange-300 transition-colors">
            Otevřít →
          </Link>
        </div>
      </div>
    </div>
  );
}
