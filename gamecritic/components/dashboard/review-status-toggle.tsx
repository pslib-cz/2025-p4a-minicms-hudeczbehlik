"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import Button from "react-bootstrap/Button";

import { REVIEW_STATUS, type ReviewStatusValue } from "@/types/review-status";

type Props = {
  reviewId: string;
  status: ReviewStatusValue;
};

export function ReviewStatusToggle({ reviewId, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);

  return (
    <Button
      type="button"
      variant={optimisticStatus === REVIEW_STATUS.PUBLISHED ? "success" : "secondary"}
      size="sm"
      disabled={pending}
      className="min-w-100"
      onClick={() => {
        const next =
          optimisticStatus === REVIEW_STATUS.DRAFT
            ? REVIEW_STATUS.PUBLISHED
            : REVIEW_STATUS.DRAFT;
        setOptimisticStatus(next);

        startTransition(async () => {
          const res = await fetch(`/api/reviews/${reviewId}/toggle-status`, {
            method: "POST",
            credentials: "include",
          });

          const json = (await res.json()) as { success: boolean; error?: string };

          if (!json.success) {
            router.refresh();
            window.alert(json.error ?? "Změna stavu se nezdařila.");
            return;
          }

          router.refresh();
        });
      }}
    >
      {optimisticStatus}
    </Button>
  );
}
