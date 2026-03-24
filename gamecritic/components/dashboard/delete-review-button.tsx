"use client";

import { useTransition } from "react";

import { deleteReview } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";

type Props = {
  reviewId: string;
};

export function DeleteReviewButton({ reviewId }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      disabled={pending}
      onClick={() => {
        const confirmed = window.confirm("Delete this review? This cannot be undone.");
        if (!confirmed) return;

        startTransition(async () => {
          await deleteReview(reviewId);
        });
      }}
      className="w-24"
    >
      Delete
    </Button>
  );
}
