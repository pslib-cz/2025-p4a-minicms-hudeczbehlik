import { redirect } from "next/navigation";

import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        action={async (formData) => {
          "use server";

          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/dashboard",
          });

          redirect("/dashboard");
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
