import { redirect } from "next/navigation";

import { CriticForm } from "@/components/forms/critic-form";
import { requireUser } from "@/lib/auth";

export default async function NewCriticPage() {
  try {
    await requireUser();
  } catch {
    redirect("/login?callbackUrl=/dashboard/critics/new");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-slate-900">Přidat kritika</h1>
      <CriticForm />
    </section>
  );
}
