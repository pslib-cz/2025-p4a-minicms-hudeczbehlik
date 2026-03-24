import { ReviewStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const PER_PAGE = 12;
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

type CatalogFilters = {
  query?: string;
  genres?: string[];
  tags?: string[];
  page?: number;
};

export async function getGamesCatalog(filters: CatalogFilters) {
  if (!hasDatabaseUrl) {
    return {
      items: [],
      page: 1,
      pages: 0,
      total: 0,
      perPage: PER_PAGE,
    };
  }

  const page = Math.max(filters.page ?? 1, 1);

  const where = {
    AND: [
      filters.query
        ? {
            OR: [
              { title: { contains: filters.query, mode: "insensitive" as const } },
              {
                description: {
                  contains: filters.query,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {},
      filters.genres?.length
        ? {
            genres: {
              some: { slug: { in: filters.genres } },
            },
          }
        : {},
      filters.tags?.length
        ? {
            tags: {
              some: { slug: { in: filters.tags } },
            },
          }
        : {},
    ],
  };

  const [items, total] = await prisma.$transaction([
    prisma.game.findMany({
      where,
      include: {
        genres: true,
        tags: true,
        reviews: {
          where: { status: ReviewStatus.PUBLISHED },
          select: { score: true },
        },
      },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.game.count({ where }),
  ]);

  return {
    items,
    page,
    pages: Math.ceil(total / PER_PAGE),
    total,
    perPage: PER_PAGE,
  };
}

export async function getGameBySlug(slug: string) {
  if (!hasDatabaseUrl) {
    return null;
  }

  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      addedBy: { select: { id: true, name: true, image: true } },
      genres: true,
      tags: true,
      screenshots: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        where: { status: ReviewStatus.PUBLISHED },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { publishDate: "desc" },
      },
    },
  });

  if (!game) {
    return null;
  }

  const avg = await prisma.review.aggregate({
    where: {
      gameId: game.id,
      status: ReviewStatus.PUBLISHED,
    },
    _avg: { score: true },
  });

  return {
    ...game,
    averageScore: avg._avg.score,
  };
}

export async function getGameFilterData() {
  if (!hasDatabaseUrl) {
    return { genres: [], tags: [] };
  }

  const [genres, tags] = await prisma.$transaction([
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { genres, tags };
}

export async function getGameSelectOptions() {
  if (!hasDatabaseUrl) {
    return [];
  }

  return prisma.game.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
    },
  });
}
