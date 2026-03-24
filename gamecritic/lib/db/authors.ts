import { prisma } from "@/lib/prisma";
import { REVIEW_STATUS } from "@/types/review-status";

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
        where: { status: REVIEW_STATUS.PUBLISHED },
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
            where: { status: REVIEW_STATUS.PUBLISHED },
          },
        },
      },
    },
  });

  return author;
}
