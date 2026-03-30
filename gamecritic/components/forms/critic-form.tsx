"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import type { ActionResult } from "@/types";
import {
  criticCreateSchema,
  type CriticCreateInput,
} from "@/lib/validations/critic";

export function CriticForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();

  const form = useForm<CriticCreateInput>({
    resolver: zodResolver(criticCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: CriticCreateInput) => {
    setError(null);
    setSuccess(null);
    setFieldErrors(undefined);

    startTransition(async () => {
      const res = await fetch("/api/critics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const result = (await res.json()) as ActionResult<{ id: string }>;

      if (!result.success) {
        setError(result.error);
        if ("fieldErrors" in result && result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        return;
      }

      setSuccess("Kritik byl úspěšně přidán.");
      form.reset({ name: "", email: "", password: "" });
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-lg bg-gradient-to-br from-gray-900 to-black p-6 shadow-xl border border-orange-600/30 space-y-6"
    >
      <div>
        <label htmlFor="critic-name" className="block text-sm font-medium text-orange-400 mb-2">
          Jméno
        </label>
        <input
          id="critic-name"
          {...form.register("name")}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          placeholder="Např. Jan Novák"
        />
        {fieldErrors?.name ? (
          <p className="text-red-400 text-sm mt-1">{fieldErrors.name.join(", ")}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="critic-email" className="block text-sm font-medium text-orange-400 mb-2">
          Email
        </label>
        <input
          id="critic-email"
          type="email"
          {...form.register("email")}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          placeholder="kritik@example.com"
        />
        {fieldErrors?.email ? (
          <p className="text-red-400 text-sm mt-1">{fieldErrors.email.join(", ")}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="critic-password" className="block text-sm font-medium text-orange-400 mb-2">
          Heslo
        </label>
        <input
          id="critic-password"
          type="password"
          {...form.register("password")}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          placeholder="Minimálně 8 znaků"
        />
        {fieldErrors?.password ? (
          <p className="text-red-400 text-sm mt-1">{fieldErrors.password.join(", ")}</p>
        ) : null}
      </div>

      {error ? <p className="text-red-400 text-sm">{error}</p> : null}
      {success ? <p className="text-green-400 text-sm">{success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Ukládám…" : "Přidat kritika"}
      </button>
    </form>
  );
}
