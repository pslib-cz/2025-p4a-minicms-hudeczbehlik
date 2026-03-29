"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  reviewId: string;
};

export function DeleteReviewButton({ reviewId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="px-3 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => {
        const confirmed = window.confirm("Smazat tuto recenzi? Tuto akci nelze vrátit.");
        if (!confirmed) return;

        startTransition(async () => {
          const res = await fetch(`/api/reviews/${reviewId}`, {
            method: "DELETE",
            credentials: "include",
          });

          const json = (await res.json()) as { success: boolean; error?: string };

          if (!json.success) {
            window.alert(json.error ?? "Smazání se nezdařilo.");
            return;
          }

          router.refresh();
        });
      }}
    >
      {pending ? "…" : "Smazat"}
    </button>
  );
}
