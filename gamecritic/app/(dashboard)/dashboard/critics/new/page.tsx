import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CriticForm } from "@/components/forms/critic-form";

export default async function NewCriticPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/critics/new");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-slate-900">Přidat kritika</h1>
      <CriticForm />
    </section>
  );
}
