import Link from "next/link";
import type { Metadata } from "next";

import {
  getPublishedReviewsCatalog,
  getReviewCatalogTags,
} from "@/lib/db/reviews";
import { scoreClass } from "@/lib/utils/score";
import type { ReviewCatalogSearchParams } from "@/types";

type CatalogItem = Awaited<
  ReturnType<typeof getPublishedReviewsCatalog>
>["items"][number];
type CatalogTag = Awaited<ReturnType<typeof getReviewCatalogTags>>[number];

export const revalidate = 3600;

function toArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ReviewCatalogSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q ?? "";

  return {
    title: q ? `Recenze: ${q}` : "Recenze",
    description: "Prohlédněte si publikované recenze her. Filtrování podle tagu a fulltextové vyhledávání.",
    alternates: {
      canonical: "/reviews",
    },
    openGraph: {
      title: q ? `Recenze: ${q}` : "Recenze | GameCritic",
      description: "Katalog publikovaných recenzí s vyhledáváním a tagy.",
    },
  };
}

export default async function ReviewsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<ReviewCatalogSearchParams>;
}) {
  const params = await searchParams;
  const tags = toArray(params.tag);
  const query = params.q?.trim() || undefined;
  const page = Number(params.page ?? "1");

  const [{ items, pages, page: currentPage }, tagList] = await Promise.all([
    getPublishedReviewsCatalog({
      query,
      tagSlug: tags[0],
      page,
    }),
    getReviewCatalogTags(),
  ]);

  const buildPageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (tags[0]) sp.set("tag", tags[0]);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/reviews?${qs}` : "/reviews";
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-white">Publikované recenze</h1>
        <p className="mt-2 text-gray-400">
          Vyhledávání v titulku a textu, filtrování podle tagu přiřazeného hře.
        </p>
      </header>

      <form className="grid gap-4 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-4 shadow-lg md:grid-cols-4">
        <input
          name="q"
          defaultValue={query}
          placeholder="Hledat v recenzích..."
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <select
          name="tag"
          defaultValue={tags[0]}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Libovolný tag</option>
          {tagList.map((tag: CatalogTag) => (
            <option key={tag.id} value={tag.slug}>
              {tag.name}
            </option>
          ))}
        </select>

        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-4 py-2 text-sm font-semibold text-white transition-all"
          >
            Použít filtry
          </button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((review: CatalogItem) => (
          <article key={review.id} className="rounded-xl bg-gradient-to-br from-gray-900 to-black border border-orange-600/30 p-4 shadow-lg hover:shadow-xl transition-shadow">
            <p className="text-sm text-gray-400">{review.game.title}</p>
            <h2 className="mt-1 text-lg font-bold text-white">{review.title}</h2>
            <p className="mt-2 text-sm text-gray-400">Autor: {review.author.name}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-sm font-semibold ${scoreClass(review.score)}`}>
                {review.score}/10
              </span>
              <Link
                href={`/reviews/${review.slug}`}
                className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                Číst recenzi
              </Link>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-gray-400">Žádné recenze neodpovídají filtru.</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={buildPageHref(p)}
            className={`rounded border px-3 py-1 text-sm ${
              p === currentPage
                ? "border-sky-600 bg-sky-50 font-semibold text-sky-800"
                : "border-slate-300"
            }`}
          >
            {p}
          </Link>
        ))}
      </div>
    </div>
  );
}
