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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
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
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-black text-slate-900">Login</h1>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white">
          Continue
        </button>
      </form>
    </main>
  );
}
