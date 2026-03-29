"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

import { REVIEW_STATUS, type ReviewStatusValue } from "@/types/review-status";

type Props = {
  reviewId: string;
  status: ReviewStatusValue;
};

export function ReviewStatusToggle({ reviewId, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);

  const isPublished = optimisticStatus === REVIEW_STATUS.PUBLISHED;

  return (
    <button
      type="button"
      disabled={pending}
      className={`min-w-[100px] px-3 py-2 text-sm font-medium rounded transition-all duration-200 ${
        isPublished
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-gray-600 hover:bg-gray-700 text-white"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
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
    </button>
  );
}
