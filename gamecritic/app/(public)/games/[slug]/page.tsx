import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getGameBySlug } from "@/lib/db/games";
import { scoreClass } from "@/lib/utils/score";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-black text-slate-900">{game.title}</h1>
        {game.description ? <p className="mt-2 text-slate-600">{game.description}</p> : null}
        <p className="mt-3 text-sm text-slate-600">
          Average score: {game.averageScore ? game.averageScore.toFixed(2) : "N/A"}
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">Published reviews</h2>
        <div className="mt-4 space-y-3">
          {game.reviews.map((review) => (
            <article key={review.id} className="rounded-xl bg-white p-4 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{review.title}</h3>
                  <Link href={`/authors/${review.author.id}`} className="text-sm text-slate-600">
                    {review.author.name}
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
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">Screenshot gallery</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {game.screenshots.map((shot) => (
            <figure key={shot.id} className="overflow-hidden rounded-xl bg-white shadow">
              <div className="relative aspect-video w-full">
                <Image
                  src={shot.url}
                  alt={shot.caption || `Screenshot of ${game.title}`}
                  fill
                  className="object-cover"
                />
              </div>
              {shot.caption ? <figcaption className="p-3 text-sm text-slate-600">{shot.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
