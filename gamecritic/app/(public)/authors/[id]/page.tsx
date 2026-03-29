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
      <section className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-6 shadow-lg">
        <h1 className="text-3xl font-black text-white">{author.name}</h1>
        <p className="mt-2 text-sm text-gray-400">
          Joined {new Date(author.createdAt).toLocaleDateString()} · {author._count.reviews} reviews
        </p>
      </section>

      <section className="space-y-3">
        {author.reviews.map((review: AuthorReview) => (
          <article key={review.id} className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">{review.title}</h2>
                <Link href={`/games/${review.game.slug}`} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                  {review.game.title}
                </Link>
              </div>
              <span className={`text-sm font-semibold ${scoreClass(review.score)}`}>
                {review.score}/10
              </span>
            </div>
            <Link href={`/reviews/${review.slug}`} className="mt-2 inline-flex text-sm text-orange-400 hover:text-orange-300 transition-colors">
              Open review
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
