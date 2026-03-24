import Link from "next/link";
import { Suspense } from "react";

import { getLatestPublishedReviews, getTopRatedPublishedReviews } from "@/lib/db/reviews";
import { scoreClass } from "@/lib/utils/score";

async function ReviewsGrid({ mode }: { mode: "latest" | "top" }) {
  const reviews =
    mode === "latest"
      ? await getLatestPublishedReviews(6)
      : await getTopRatedPublishedReviews(6);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <article key={review.id} className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-slate-600">{review.game.title}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{review.title}</h3>
          <p className="mt-2 text-sm text-slate-600">by {review.author.name}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className={`text-sm font-semibold ${scoreClass(review.score)}`}>
              {review.score}/10
            </span>
            <Link href={`/reviews/${review.slug}`} className="text-sm font-semibold text-sky-600">
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
        <div key={index} className="h-40 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}

export default async function HomePage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Latest reviews</h1>
        <p className="mt-2 text-slate-600">Freshly published from the GameCritic community.</p>
        <div className="mt-6">
          <Suspense fallback={<GridSkeleton />}>
            <ReviewsGrid mode="latest" />
          </Suspense>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Top-rated reviews</h2>
        <p className="mt-2 text-slate-600">Highest-scoring takes right now.</p>
        <div className="mt-6">
          <Suspense fallback={<GridSkeleton />}>
            <ReviewsGrid mode="top" />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
