import { prisma } from "@/lib/prisma";
import { REVIEW_STATUS } from "@/types/review-status";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const CATALOG_PER_PAGE = 12;
const DASHBOARD_PER_PAGE = 10;

export async function getLatestPublishedReviews(limit = 6) {
  if (!hasDatabaseUrl) {
    return [];
  }

  return prisma.review.findMany({
    where: { status: REVIEW_STATUS.PUBLISHED },
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
    where: { status: REVIEW_STATUS.PUBLISHED },
    orderBy: [{ score: "desc" }, { publishDate: "desc" }],
    take: limit,
    include: {
      game: { select: { id: true, title: true, slug: true, coverImage: true } },
      author: { select: { id: true, name: true, image: true } },
    },
  });
}

/** Veřejný detail — pouze publikované recenze (drafty nejsou přístupné přes URL). */
export async function getPublishedReviewBySlug(slug: string) {
  if (!hasDatabaseUrl) {
    return null;
  }

  return prisma.review.findFirst({
    where: { slug, status: REVIEW_STATUS.PUBLISHED },
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

  const reviews: Array<{ slug: string }> = await prisma.review.findMany({
    where: { status: REVIEW_STATUS.PUBLISHED },
    orderBy: [{ score: "desc" }, { publishDate: "desc" }],
    take: limit,
    select: { slug: true },
  });

  return reviews.map((review: { slug: string }) => ({ slug: review.slug }));
}

export type PublishedReviewsCatalogFilters = {
  query?: string;
  tagSlug?: string;
  page?: number;
};

export async function getPublishedReviewsCatalog(filters: PublishedReviewsCatalogFilters) {
  if (!hasDatabaseUrl) {
    return {
      items: [],
      page: 1,
      pages: 0,
      total: 0,
      perPage: CATALOG_PER_PAGE,
    };
  }

  const page = Math.max(filters.page ?? 1, 1);

  const where = {
    status: REVIEW_STATUS.PUBLISHED,
    AND: [
      filters.query
        ? {
            OR: [
              { title: { contains: filters.query, mode: "insensitive" as const } },
              { content: { contains: filters.query, mode: "insensitive" as const } },
            ],
          }
        : {},
      filters.tagSlug
        ? {
            game: {
              tags: { some: { slug: filters.tagSlug } },
            },
          }
        : {},
    ],
  };

  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
      take: CATALOG_PER_PAGE,
      skip: (page - 1) * CATALOG_PER_PAGE,
      include: {
        game: { select: { id: true, title: true, slug: true, coverImage: true } },
        author: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    items,
    page,
    pages: Math.max(1, Math.ceil(total / CATALOG_PER_PAGE)),
    total,
    perPage: CATALOG_PER_PAGE,
  };
}

export async function getReviewCatalogTags() {
  if (!hasDatabaseUrl) {
    return [];
  }

  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export async function getMyReviewsPaginated(userId: string, page: number) {
  if (!hasDatabaseUrl) {
    return {
      items: [],
      page: 1,
      pages: 0,
      total: 0,
      perPage: DASHBOARD_PER_PAGE,
    };
  }

  const p = Math.max(page, 1);
  const skip = (p - 1) * DASHBOARD_PER_PAGE;

  const where = { authorId: userId };

  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: DASHBOARD_PER_PAGE,
      include: {
        game: { select: { title: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    items,
    page: p,
    pages: Math.max(1, Math.ceil(total / DASHBOARD_PER_PAGE)),
    total,
    perPage: DASHBOARD_PER_PAGE,
  };
}

export async function getReviewByIdForAuthor(id: string, authorId: string) {
  if (!hasDatabaseUrl) {
    return null;
  }

  return prisma.review.findFirst({
    where: { id, authorId },
  });
}
