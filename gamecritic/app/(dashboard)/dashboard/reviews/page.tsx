import Link from "next/link";

import { auth } from "@/auth";
import { DeleteReviewButton } from "@/components/dashboard/delete-review-button";
import { ReviewStatusToggle } from "@/components/dashboard/review-status-toggle";
import { getMyReviews } from "@/lib/db/reviews";

type DashboardReview = Awaited<ReturnType<typeof getMyReviews>>[number];

export default async function DashboardReviewsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const reviews = await getMyReviews(session.user.id);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">Your reviews</h1>
        <Link
          href="/dashboard/reviews/new"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
        >
          New review
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Game</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Publish date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review: DashboardReview) => (
              <tr key={review.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">{review.title}</td>
                <td className="px-4 py-3 text-slate-700">{review.game.title}</td>
                <td className="px-4 py-3 text-slate-700">{review.score}</td>
                <td className="px-4 py-3">
                  <ReviewStatusToggle reviewId={review.id} status={review.status} />
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {review.publishDate
                    ? new Date(review.publishDate).toLocaleString()
                    : "Not published"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/reviews/${review.id}/edit`}
                      className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-900"
                    >
                      Edit
                    </Link>
                    <DeleteReviewButton reviewId={review.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
