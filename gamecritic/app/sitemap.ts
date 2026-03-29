import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { REVIEW_STATUS } from "@/types/review-status";
import { getSiteUrl } from "@/lib/utils/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  if (!process.env.DATABASE_URL) {
    return [
      { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      { url: `${base}/games`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
      { url: `${base}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ];
  }

  const [games, reviews, authors] = await Promise.all([
    prisma.game.findMany({ select: { slug: true, createdAt: true } }),
    prisma.review.findMany({
      where: { status: REVIEW_STATUS.PUBLISHED },
      select: { slug: true, updatedAt: true },
    }),
    prisma.user.findMany({ select: { id: true } }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/games`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const gameEntries: MetadataRoute.Sitemap = games.map((g) => ({
    url: `${base}/games/${g.slug}`,
    lastModified: g.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const reviewEntries: MetadataRoute.Sitemap = reviews.map((r) => ({
    url: `${base}/reviews/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const authorEntries: MetadataRoute.Sitemap = authors.map((a) => ({
    url: `${base}/authors/${a.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [...staticEntries, ...gameEntries, ...reviewEntries, ...authorEntries];
}
