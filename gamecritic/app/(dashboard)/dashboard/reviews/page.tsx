import Link from "next/link";

import { auth } from "@/auth";
import { DeleteReviewButton } from "@/components/dashboard/delete-review-button";
import { ReviewStatusToggle } from "@/components/dashboard/review-status-toggle";
import { getMyReviewsPaginated } from "@/lib/db/reviews";

type DashboardReview = Awaited<
  ReturnType<typeof getMyReviewsPaginated>
>["items"][number];

export default async function DashboardReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  if (!session?.user?.id) {
    return null;
  }

  const { items: reviews, pages, page: currentPage } = await getMyReviewsPaginated(
    session.user.id,
    page,
  );

  const buildHref = (p: number) => (p <= 1 ? "/dashboard/reviews" : `/dashboard/reviews?page=${p}`);

  return (
    <section>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Vaše recenze</h1>
        <Link href="/dashboard/reviews/new" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-200">
          Nová recenze
        </Link>
      </div>

      <div className="rounded-lg overflow-hidden shadow-xl border border-orange-600/30 bg-gradient-to-br from-gray-900 to-black">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800 border-b border-orange-600/30">
              <tr>
                <th className="px-6 py-4 font-semibold text-orange-400">Název</th>
                <th className="px-6 py-4 font-semibold text-orange-400">Hra</th>
                <th className="px-6 py-4 font-semibold text-orange-400">Skóre</th>
                <th className="px-6 py-4 font-semibold text-orange-400">Stav</th>
                <th className="px-6 py-4 font-semibold text-orange-400">Publikováno</th>
                <th className="px-6 py-4 font-semibold text-orange-400">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {reviews.map((review: DashboardReview) => (
                <tr key={review.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{review.title}</td>
                  <td className="px-6 py-4 text-gray-300">{review.game.title}</td>
                  <td className="px-6 py-4 text-gray-300">{review.score}</td>
                  <td className="px-6 py-4">
                    <ReviewStatusToggle reviewId={review.id} status={review.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap text-xs">
                    {review.publishDate
                      ? new Date(review.publishDate).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/reviews/${review.id}/edit`}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 text-sm font-medium rounded transition-all duration-200"
                      >
                        Upravit
                      </Link>
                      <DeleteReviewButton reviewId={review.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 ? (
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref(p)}
              className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
                p === currentPage
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
