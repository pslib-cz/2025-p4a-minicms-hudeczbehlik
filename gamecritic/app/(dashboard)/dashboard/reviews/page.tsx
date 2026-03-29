import Link from "next/link";
import Table from "react-bootstrap/Table";

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
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h1 className="h2 fw-bold text-dark mb-0">Vaše recenze</h1>
        <Link href="/dashboard/reviews/new" className="btn btn-primary">
          Nová recenze
        </Link>
      </div>

      <div className="table-responsive rounded shadow-sm bg-white">
        <Table striped bordered hover size="sm" className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>Název</th>
              <th>Hra</th>
              <th>Skóre</th>
              <th>Stav</th>
              <th>Publikováno</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review: DashboardReview) => (
              <tr key={review.id}>
                <td className="fw-medium">{review.title}</td>
                <td>{review.game.title}</td>
                <td>{review.score}</td>
                <td>
                  <ReviewStatusToggle reviewId={review.id} status={review.status} />
                </td>
                <td className="text-nowrap small">
                  {review.publishDate
                    ? new Date(review.publishDate).toLocaleString()
                    : "—"}
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/reviews/${review.id}/edit`}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Upravit
                    </Link>
                    <DeleteReviewButton reviewId={review.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pages > 1 ? (
        <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref(p)}
              className={`btn btn-sm ${p === currentPage ? "btn-primary" : "btn-outline-secondary"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
