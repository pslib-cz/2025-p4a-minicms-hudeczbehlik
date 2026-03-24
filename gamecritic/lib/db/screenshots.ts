import { prisma } from "@/lib/prisma";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export async function getMyScreenshots(userId: string) {
  if (!hasDatabaseUrl) {
    return [];
  }

  return prisma.screenshot.findMany({
    where: { userId },
    include: {
      game: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
