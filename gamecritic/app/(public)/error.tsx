"use client";

export default function PublicError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white">Something went wrong</h2>
      <p className="mt-2 text-sm text-gray-400">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:to-red-700 transition-all"
      >
        Try again
      </button>
    </div>
  );
}
