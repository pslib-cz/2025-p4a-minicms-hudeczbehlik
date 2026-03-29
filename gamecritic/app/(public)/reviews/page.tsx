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
        <h1 className="text-3xl font-black text-slate-900">Publikované recenze</h1>
        <p className="mt-2 text-slate-600">
          Vyhledávání v titulku a textu, filtrování podle tagu přiřazeného hře.
        </p>
      </header>

      <form className="grid gap-4 rounded-xl bg-white p-4 shadow md:grid-cols-4">
        <input
          name="q"
          defaultValue={query}
          placeholder="Hledat v recenzích..."
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />

        <select
          name="tag"
          defaultValue={tags[0]}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Použít filtry
          </button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((review: CatalogItem) => (
          <article key={review.id} className="rounded-xl bg-white p-4 shadow">
            <p className="text-sm text-slate-600">{review.game.title}</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{review.title}</h2>
            <p className="mt-2 text-sm text-slate-600">Autor: {review.author.name}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-sm font-semibold ${scoreClass(review.score)}`}>
                {review.score}/10
              </span>
              <Link
                href={`/reviews/${review.slug}`}
                className="text-sm font-semibold text-sky-600"
              >
                Číst recenzi
              </Link>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-slate-600">Žádné recenze neodpovídají filtru.</p>
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
