import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { ReviewForm } from "@/components/forms/review-form";
import { getGameSelectOptions } from "@/lib/db/games";
import { getReviewByIdForAuthor } from "@/lib/db/reviews";

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session, games] = await Promise.all([
    params,
    auth(),
    getGameSelectOptions(),
  ]);

  if (!session?.user?.id) {
    notFound();
  }

  const review = await getReviewByIdForAuthor(id, session.user.id);

  if (!review) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-black text-white">Edit review</h1>
      <ReviewForm
        reviewId={review.id}
        games={games}
        defaultValues={{
          title: review.title,
          slug: review.slug,
          content: review.content,
          score: review.score,
          status: review.status,
          publishDate: review.publishDate ?? undefined,
          gameId: review.gameId,
        }}
      />
    </section>
  );
}
