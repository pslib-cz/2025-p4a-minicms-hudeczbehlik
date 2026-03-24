"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewFormSchema } from "@/lib/validations/review";
import { fail, ok, zodFail } from "@/lib/utils/action-result";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { REVIEW_STATUS, type ReviewStatusValue } from "@/types/review-status";
import type { ActionResult, ReviewFormData } from "@/types";

export async function createReview(
  data: ReviewFormData,
): Promise<ActionResult<{ slug: string }>> {
  try {
    const user = await requireUser();
    const parsed = reviewFormSchema.safeParse(data);

    if (!parsed.success) {
      return zodFail(parsed.error);
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
        authorId: user.id,
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

    revalidatePath("/");
    revalidatePath("/games");
    if (game?.slug) {
      revalidatePath(`/games/${game.slug}`);
    }
    revalidatePath("/games/[slug]", "page");
    revalidatePath(`/reviews/${slug}`);
    revalidatePath("/dashboard/reviews");
    revalidateTag("reviews", "max");

    return ok({ slug });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("Unauthorized");
    }

    return fail("Failed to create review");
  }
}

export async function updateReview(
  id: string,
  data: ReviewFormData,
): Promise<ActionResult<void>> {
  try {
    const user = await requireUser();
    const parsed = reviewFormSchema.safeParse(data);

    if (!parsed.success) {
      return zodFail(parsed.error);
    }

    const existing = await prisma.review.findFirst({
      where: { id, authorId: user.id },
    });

    if (!existing) {
      return fail("Review not found");
    }

    const input = parsed.data;
    const slug = await generateUniqueSlug(
      input.slug?.length ? input.slug : input.title,
      "review",
      id,
    );

    await prisma.review.update({
      where: { id },
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

    revalidatePath("/");
    revalidatePath("/games");
    if (game?.slug) {
      revalidatePath(`/games/${game.slug}`);
    }
    revalidatePath("/games/[slug]", "page");
    revalidatePath(`/reviews/${existing.slug}`);
    revalidatePath(`/reviews/${slug}`);
    revalidatePath("/dashboard/reviews");
    revalidateTag("reviews", "max");

    return ok(undefined);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("Unauthorized");
    }

    return fail("Failed to update review");
  }
}

export async function deleteReview(id: string): Promise<ActionResult<void>> {
  try {
    const user = await requireUser();

    const existing = await prisma.review.findFirst({
      where: { id, authorId: user.id },
      select: { slug: true, game: { select: { slug: true } } },
    });

    if (!existing) {
      return fail("Review not found");
    }

    await prisma.review.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/games");
    revalidatePath(`/games/${existing.game.slug}`);
    revalidatePath("/games/[slug]", "page");
    revalidatePath(`/reviews/${existing.slug}`);
    revalidatePath("/dashboard/reviews");
    revalidateTag("reviews", "max");

    return ok(undefined);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("Unauthorized");
    }

    return fail("Failed to delete review");
  }
}

export async function toggleReviewStatus(
  id: string,
): Promise<ActionResult<ReviewStatusValue>> {
  try {
    const user = await requireUser();

    const existing = await prisma.review.findFirst({
      where: { id, authorId: user.id },
      select: { id: true, status: true, slug: true, game: { select: { slug: true } } },
    });

    if (!existing) {
      return fail("Review not found");
    }

    const nextStatus =
      existing.status === REVIEW_STATUS.DRAFT
        ? REVIEW_STATUS.PUBLISHED
        : REVIEW_STATUS.DRAFT;

    await prisma.review.update({
      where: { id },
      data: {
        status: nextStatus,
        publishDate: nextStatus === REVIEW_STATUS.PUBLISHED ? new Date() : null,
      },
    });

    revalidatePath("/");
    revalidatePath("/games");
    revalidatePath(`/games/${existing.game.slug}`);
    revalidatePath("/games/[slug]", "page");
    revalidatePath(`/reviews/${existing.slug}`);
    revalidatePath("/dashboard/reviews");
    revalidateTag("reviews", "max");

    return ok(nextStatus);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("Unauthorized");
    }

    return fail("Failed to toggle review status");
  }
}
