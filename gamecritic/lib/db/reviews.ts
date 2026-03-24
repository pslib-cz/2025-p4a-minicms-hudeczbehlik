import { ReviewStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export async function getLatestPublishedReviews(limit = 6) {
  if (!hasDatabaseUrl) {
    return [];
  }

  return prisma.review.findMany({
    where: { status: ReviewStatus.PUBLISHED },
    orderBy: { publishDate: "desc" },
    take: limit,
    include: {
      game: { select: { id: true, title: true, slug: true, coverImage: true } },
      author: { select: { id: true, name: true, image: true } },
    },
  });
}

export async function getTopRatedPublishedReviews(limit = 6) {
  if (!hasDatabaseUrl) {
    return [];
  }

  return prisma.review.findMany({
    where: { status: ReviewStatus.PUBLISHED },
    orderBy: [{ score: "desc" }, { publishDate: "desc" }],
    take: limit,
    include: {
      game: { select: { id: true, title: true, slug: true, coverImage: true } },
      author: { select: { id: true, name: true, image: true } },
    },
  });
}

export async function getReviewBySlug(slug: string) {
  if (!hasDatabaseUrl) {
    return null;
  }

  return prisma.review.findUnique({
    where: { slug },
    include: {
      game: { select: { id: true, title: true, slug: true, coverImage: true } },
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function getTopReviewSlugs(limit = 100) {
  if (!hasDatabaseUrl) {
    return [];
  }

  const reviews = await prisma.review.findMany({
    where: { status: ReviewStatus.PUBLISHED },
    orderBy: [{ score: "desc" }, { publishDate: "desc" }],
    take: limit,
    select: { slug: true },
  });

  return reviews.map((review) => ({ slug: review.slug }));
}

export async function getMyReviews(userId: string) {
  if (!hasDatabaseUrl) {
    return [];
  }

  return prisma.review.findMany({
    where: { authorId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      game: { select: { title: true } },
    },
  });
}

export async function getReviewByIdForAuthor(id: string, authorId: string) {
  if (!hasDatabaseUrl) {
    return null;
  }

  return prisma.review.findFirst({
    where: { id, authorId },
  });
}
