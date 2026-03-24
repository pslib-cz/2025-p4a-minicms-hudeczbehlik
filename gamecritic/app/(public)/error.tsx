"use client";

export default function PublicError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
