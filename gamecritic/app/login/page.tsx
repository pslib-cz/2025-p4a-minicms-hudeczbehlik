import { redirect } from "next/navigation";

import { signIn } from "@/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const redirectTo = (() => {
    if (!callbackUrl) return "/dashboard";
    if (callbackUrl.startsWith("/")) return callbackUrl;
    // Allow absolute URLs only for same-origin redirects.
    try {
      const url = new URL(callbackUrl);
      if (url.origin === process.env.NEXT_PUBLIC_SITE_URL || url.origin === "http://localhost:3000") {
        return `${url.pathname}${url.search}`;
      }
    } catch {
      // ignore
    }
    return "/dashboard";
  })();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <form
        action={async (formData) => {
          "use server";

          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo,
          });

          redirect(redirectTo);
        }}
        className="w-full max-w-md space-y-4 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-6 shadow-lg"
      >
        <h1 className="text-2xl font-black text-white">Login</h1>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors">
          Continue
        </button>
      </form>
    </main>
  );
}
