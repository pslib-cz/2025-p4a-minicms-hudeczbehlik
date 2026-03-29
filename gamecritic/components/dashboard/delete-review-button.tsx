"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Button from "react-bootstrap/Button";

type Props = {
  reviewId: string;
};

export function DeleteReviewButton({ reviewId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
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
    </Button>
  );
}
