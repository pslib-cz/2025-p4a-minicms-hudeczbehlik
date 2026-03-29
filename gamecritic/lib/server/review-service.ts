import { revalidatePath, revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { fail, ok } from "@/lib/utils/action-result";
import type { ActionResult } from "@/types";
import { reviewFormSchema } from "@/lib/validations/review";
import { REVIEW_STATUS, type ReviewStatusValue } from "@/types/review-status";

function revalidateReviewCaches(slugs: { reviewSlug: string; gameSlug: string | null }) {
  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath("/reviews");
  if (slugs.gameSlug) {
    revalidatePath(`/games/${slugs.gameSlug}`);
  }
  revalidatePath("/games/[slug]", "page");
  revalidatePath(`/reviews/${slugs.reviewSlug}`);
  revalidatePath("/dashboard/reviews");
  revalidateTag("reviews", "max");
}

export async function createReviewForUser(
  userId: string,
  raw: unknown,
): Promise<ActionResult<{ slug: string }>> {
  const parsed = reviewFormSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const input = parsed.data;
  const slug = await generateUniqueSlug(
    input.slug?.length ? input.slug : input.title,
    "review",
  );

  await prisma.review.create({
    data: {
      title: input.title,
      slug,
      content: input.content,
      score: input.score,
      gameId: input.gameId,
      authorId: userId,
      status: input.status,
      publishDate:
        input.status === REVIEW_STATUS.PUBLISHED
          ? input.publishDate ?? new Date()
          : null,
    },
  });

  const game = await prisma.game.findUnique({
    where: { id: input.gameId },
    select: { slug: true },
  });

  revalidateReviewCaches({ reviewSlug: slug, gameSlug: game?.slug ?? null });

  return ok({ slug });
}

export async function updateReviewForUser(
  userId: string,
  reviewId: string,
  raw: unknown,
): Promise<ActionResult<void>> {
  const parsed = reviewFormSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.review.findFirst({
    where: { id: reviewId, authorId: userId },
  });

  if (!existing) {
    return fail("Review not found");
  }

  const input = parsed.data;
  const slug = await generateUniqueSlug(
    input.slug?.length ? input.slug : input.title,
    "review",
    reviewId,
  );

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      title: input.title,
      slug,
      content: input.content,
      score: input.score,
      gameId: input.gameId,
      status: input.status,
      publishDate:
        input.status === REVIEW_STATUS.PUBLISHED
          ? input.publishDate ?? existing.publishDate ?? new Date()
          : null,
    },
  });

  const game = await prisma.game.findUnique({
    where: { id: input.gameId },
    select: { slug: true },
  });

  revalidateReviewCaches({
    reviewSlug: slug,
    gameSlug: game?.slug ?? null,
  });

  return ok(undefined);
}

export async function deleteReviewForUser(
  userId: string,
  reviewId: string,
): Promise<ActionResult<void>> {
  const existing = await prisma.review.findFirst({
    where: { id: reviewId, authorId: userId },
    select: { slug: true, game: { select: { slug: true } } },
  });

  if (!existing) {
    return fail("Review not found");
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  revalidateReviewCaches({
    reviewSlug: existing.slug,
    gameSlug: existing.game.slug,
  });

  return ok(undefined);
}

export async function toggleReviewStatusForUser(
  userId: string,
  reviewId: string,
): Promise<ActionResult<ReviewStatusValue>> {
  const existing = await prisma.review.findFirst({
    where: { id: reviewId, authorId: userId },
    select: { id: true, status: true, slug: true, game: { select: { slug: true } } },
  });

  if (!existing) {
    return fail("Review not found");
  }

  const nextStatus =
    existing.status === REVIEW_STATUS.DRAFT ? REVIEW_STATUS.PUBLISHED : REVIEW_STATUS.DRAFT;

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: nextStatus,
      publishDate: nextStatus === REVIEW_STATUS.PUBLISHED ? new Date() : null,
    },
  });

  revalidateReviewCaches({
    reviewSlug: existing.slug,
    gameSlug: existing.game.slug,
  });

  return ok(nextStatus);
}
