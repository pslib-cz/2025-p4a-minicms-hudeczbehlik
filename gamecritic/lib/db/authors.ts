import { ReviewStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export async function getAuthorProfile(id: string) {
  if (!hasDatabaseUrl) {
    return null;
  }

  const author = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      reviews: {
        where: { status: ReviewStatus.PUBLISHED },
        orderBy: { publishDate: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          score: true,
          publishDate: true,
          game: {
            select: { title: true, slug: true },
          },
        },
      },
      _count: {
        select: {
          reviews: {
            where: { status: ReviewStatus.PUBLISHED },
          },
        },
      },
    },
  });

  return author;
}
