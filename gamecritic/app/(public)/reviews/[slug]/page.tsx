import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getReviewBySlug, getTopReviewSlugs } from "@/lib/db/reviews";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { scoreClass } from "@/lib/utils/score";

export async function generateStaticParams() {
  return getTopReviewSlugs(100);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const review = await getReviewBySlug(slug);

  if (!review) {
    return {
      title: "Review not found | GameCritic",
    };
  }

  return {
    title: `${review.title} | GameCritic`,
    description: review.content.replace(/<[^>]+>/g, "").slice(0, 155),
    openGraph: {
      title: review.title,
      description: review.content.replace(/<[^>]+>/g, "").slice(0, 155),
      images: review.game.coverImage ? [review.game.coverImage] : [],
    },
  };
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = await getReviewBySlug(slug);

  if (!review) {
    notFound();
  }

  const safeHtml = sanitizeHtml(review.content);

  return (
    <article className="space-y-8">
      <header className="rounded-xl bg-white p-6 shadow">
        <p className="text-sm text-slate-600">{review.game.title}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">{review.title}</h1>
        <p className={`mt-3 text-lg ${scoreClass(review.score)}`}>{review.score}/10</p>
      </header>

      <section className="prose max-w-none rounded-xl bg-white p-6 shadow">
        <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
      </section>

      <aside className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-bold text-slate-900">Author</h2>
        <div className="mt-3 flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-200">
            {review.author.image ? (
              <Image src={review.author.image} alt={review.author.name} fill className="object-cover" />
            ) : null}
          </div>
          <div>
            <p className="font-medium text-slate-900">{review.author.name}</p>
            <Link href={`/authors/${review.author.id}`} className="text-sm text-sky-600">
              View profile
            </Link>
          </div>
        </div>
      </aside>
    </article>
  );
}
