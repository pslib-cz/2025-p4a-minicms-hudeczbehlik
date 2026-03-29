import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getGameBySlug } from "@/lib/db/games";
import { scoreClass } from "@/lib/utils/score";

type GameDetail = NonNullable<Awaited<ReturnType<typeof getGameBySlug>>>;
type GameDetailReview = GameDetail["reviews"][number];
type GameDetailScreenshot = GameDetail["screenshots"][number];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return { title: "Hra nenalezena" };
  }

  const desc =
    game.description?.slice(0, 155) ?? `Recenze a detaily hry ${game.title} na GameCritic.`;

  return {
    title: game.title,
    description: desc,
    alternates: {
      canonical: `/games/${slug}`,
    },
    openGraph: {
      title: game.title,
      description: desc,
      url: `/games/${slug}`,
      images: game.coverImage ? [game.coverImage] : [],
    },
  };
}

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
      <header className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-6 shadow-lg">
        <h1 className="text-3xl font-black text-white">{game.title}</h1>
        {game.description ? <p className="mt-2 text-gray-400">{game.description}</p> : null}
        <p className="mt-3 text-sm text-gray-400">
          Average score: {game.averageScore ? game.averageScore.toFixed(2) : "N/A"}
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-bold text-white">Published reviews</h2>
        <div className="mt-4 space-y-3">
          {game.reviews.map((review: GameDetailReview) => (
            <article key={review.id} className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{review.title}</h3>
                  <Link href={`/authors/${review.author.id}`} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                    {review.author.name}
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
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Screenshot gallery</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {game.screenshots.map((shot: GameDetailScreenshot) => (
            <figure key={shot.id} className="overflow-hidden rounded-xl bg-gray-800 shadow-lg border border-orange-600/30">
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
