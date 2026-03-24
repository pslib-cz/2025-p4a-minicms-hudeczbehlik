import Link from "next/link";
import { notFound } from "next/navigation";

import { getAuthorProfile } from "@/lib/db/authors";
import { scoreClass } from "@/lib/utils/score";

type AuthorProfile = NonNullable<Awaited<ReturnType<typeof getAuthorProfile>>>;
type AuthorReview = AuthorProfile["reviews"][number];

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const author = await getAuthorProfile(id);

  if (!author) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-black text-slate-900">{author.name}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Joined {new Date(author.createdAt).toLocaleDateString()} · {author._count.reviews} reviews
        </p>
      </section>

      <section className="space-y-3">
        {author.reviews.map((review: AuthorReview) => (
          <article key={review.id} className="rounded-xl bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">{review.title}</h2>
                <Link href={`/games/${review.game.slug}`} className="text-sm text-slate-600">
                  {review.game.title}
                </Link>
              </div>
              <span className={`text-sm font-semibold ${scoreClass(review.score)}`}>
                {review.score}/10
              </span>
            </div>
            <Link href={`/reviews/${review.slug}`} className="mt-2 inline-flex text-sm text-sky-600">
              Open review
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
