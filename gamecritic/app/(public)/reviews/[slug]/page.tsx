import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedReviewBySlug, getTopReviewSlugs } from "@/lib/db/reviews";
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
  const review = await getPublishedReviewBySlug(slug);

  if (!review) {
    return {
      title: "Review not found | GameCritic",
    };
  }

  const plain = review.content.replace(/<[^>]+>/g, "").slice(0, 155);

  return {
    title: `${review.title} | GameCritic`,
    description: plain,
    alternates: {
      canonical: `/reviews/${slug}`,
    },
    openGraph: {
      title: review.title,
      description: plain,
      url: `/reviews/${slug}`,
      type: "article",
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
  const review = await getPublishedReviewBySlug(slug);

  if (!review) {
    notFound();
  }

  const safeHtml = sanitizeHtml(review.content);

  return (
    <article className="space-y-8">
      <header className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-6 shadow-lg">
        <p className="text-sm text-gray-400">{review.game.title}</p>
        <h1 className="mt-2 text-3xl font-black text-white">{review.title}</h1>
        <p className={`mt-3 text-lg ${scoreClass(review.score)}`}>{review.score}/10</p>
      </header>

      <section className="prose prose-invert max-w-none rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-6 shadow-lg">
        <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
      </section>

      <aside className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-6 shadow-lg">
        <h2 className="text-lg font-bold text-white">Author</h2>
        <div className="mt-3 flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-700">
            {review.author.image ? (
              <Image src={review.author.image} alt={review.author.name} fill className="object-cover" />
            ) : null}
          </div>
          <div>
            <p className="font-medium text-white">{review.author.name}</p>
            <Link href={`/authors/${review.author.id}`} className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
              View profile
            </Link>
          </div>
        </div>
      </aside>
    </article>
  );
}
