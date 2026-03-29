import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-6 shadow-lg">
      <h1 className="text-2xl font-black text-white">Resource not found</h1>
      <p className="mt-2 text-gray-400">The dashboard item you requested was not found.</p>
      <Link href="/dashboard" className="mt-4 inline-flex text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors">
        Back to dashboard
      </Link>
    </div>
  );
}
