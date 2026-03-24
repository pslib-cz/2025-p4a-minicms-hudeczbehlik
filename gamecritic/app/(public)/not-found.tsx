import Link from "next/link";

export default function PublicNotFound() {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-black text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">The requested resource does not exist.</p>
      <Link href="/" className="mt-4 inline-flex text-sm font-semibold text-sky-600">
        Back to homepage
      </Link>
    </div>
  );
}
