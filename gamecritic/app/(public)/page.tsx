import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import { getLatestPublishedReviews, getTopRatedPublishedReviews } from "@/lib/db/reviews";
import { scoreClass } from "@/lib/utils/score";

export const metadata: Metadata = {
  title: "Domů",
  description: "Nejnovější a nejlépe hodnocené herní recenze od komunity GameCritic.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GameCritic",
    description: "Komunitní platforma pro recenze her.",
  },
};

type HomeReview = Awaited<ReturnType<typeof getLatestPublishedReviews>>[number];

async function ReviewsGrid({ mode }: { mode: "latest" | "top" }) {
  const reviews =
    mode === "latest"
      ? await getLatestPublishedReviews(6)
      : await getTopRatedPublishedReviews(6);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review: HomeReview) => (
        <article key={review.id} className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-4 shadow-lg hover:shadow-xl transition-shadow">
          <p className="text-sm text-gray-400">{review.game.title}</p>
          <h3 className="mt-1 text-lg font-bold text-white">{review.title}</h3>
          <p className="mt-2 text-sm text-gray-400">by {review.author.name}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className={`text-sm font-semibold ${scoreClass(review.score)}`}>
              {review.score}/10
            </span>
            <Link href={`/reviews/${review.slug}`} className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors">
              Read review
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-40 animate-pulse rounded-xl bg-gray-700 border border-orange-600/30" />
      ))}
    </div>
  );
}

export default async function HomePage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-black tracking-tight text-orange-400">Latest reviews</h1>
        <p className="mt-2 text-gray-300">Freshly published from the GameCritic community.</p>
        <div className="mt-6">
          <Suspense fallback={<GridSkeleton />}>
            <ReviewsGrid mode="latest" />
          </Suspense>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-black tracking-tight text-orange-400">Top-rated reviews</h2>
        <p className="mt-2 text-gray-300">Highest-scoring takes right now.</p>
        <div className="mt-6">
          <Suspense fallback={<GridSkeleton />}>
            <ReviewsGrid mode="top" />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
