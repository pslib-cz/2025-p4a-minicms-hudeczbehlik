"use client";

import { useOptimistic, useTransition } from "react";

import { toggleReviewStatus } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { REVIEW_STATUS, type ReviewStatusValue } from "@/types/review-status";

type Props = {
  reviewId: string;
  status: ReviewStatusValue;
};

export function ReviewStatusToggle({ reviewId, status }: Props) {
  const [pending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);

  return (
    <Button
      type="button"
      variant={optimisticStatus === REVIEW_STATUS.PUBLISHED ? "primary" : "secondary"}
      disabled={pending}
      onClick={() => {
        setOptimisticStatus(
          optimisticStatus === REVIEW_STATUS.DRAFT
            ? REVIEW_STATUS.PUBLISHED
            : REVIEW_STATUS.DRAFT,
        );

        startTransition(async () => {
          await toggleReviewStatus(reviewId);
        });
      }}
      className="w-28"
    >
      {optimisticStatus}
    </Button>
  );
}
