import Link from "next/link";
import type { Metadata } from "next";

import { getGameFilterData, getGamesCatalog } from "@/lib/db/games";
import type { CatalogSearchParams } from "@/types";

export const revalidate = 3600;

type GamesCatalogResult = Awaited<ReturnType<typeof getGamesCatalog>>;
type CatalogGame = GamesCatalogResult["items"][number];
type FilterResult = Awaited<ReturnType<typeof getGameFilterData>>;
type CatalogGenre = FilterResult["genres"][number];
type CatalogTag = FilterResult["tags"][number];

function toArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q ?? "";

  return {
    title: q ? `Games matching ${q} | GameCritic` : "Game Catalog | GameCritic",
    description: "Browse games with filters for genres, tags, and search terms.",
    alternates: {
      canonical: "/games",
    },
    openGraph: {
      title: q ? `Games: ${q}` : "Game Catalog",
      description: "Browse games with filters for genres, tags, and search terms.",
    },
  };
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;
  const genres = toArray(params.genre);
  const tags = toArray(params.tag);
  const query = params.q;
  const page = Number(params.page ?? "1");

  const [{ items, pages }, filters] = await Promise.all([
    getGamesCatalog({ query, genres, tags, page }),
    getGameFilterData(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900">Game Catalog</h1>
        <p className="mt-2 text-slate-600">Filter by genre, tag, and search query.</p>
      </header>

      <form className="grid gap-4 rounded-xl bg-white p-4 shadow md:grid-cols-4">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search games..."
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />

        <select name="genre" defaultValue={genres[0]} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">Any genre</option>
          {filters.genres.map((genre: CatalogGenre) => (
            <option key={genre.id} value={genre.slug}>
              {genre.name}
            </option>
          ))}
        </select>

        <select name="tag" defaultValue={tags[0]} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">Any tag</option>
          {filters.tags.map((tag: CatalogTag) => (
            <option key={tag.id} value={tag.slug}>
              {tag.name}
            </option>
          ))}
        </select>

        <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white">Apply</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((game: CatalogGame) => (
          <article key={game.id} className="rounded-xl bg-white p-4 shadow">
            <h2 className="text-xl font-bold text-slate-900">{game.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{game.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {game.genres.map((genre: CatalogGenre) => (
                <span key={genre.id} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {genre.name}
                </span>
              ))}
            </div>
            <Link href={`/games/${game.slug}`} className="mt-4 inline-flex text-sm font-semibold text-sky-600">
              Open details
            </Link>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
          const sp = new URLSearchParams();
          if (query) sp.set("q", query);
          if (genres[0]) sp.set("genre", genres[0]);
          if (tags[0]) sp.set("tag", tags[0]);
          if (p > 1) sp.set("page", String(p));
          const qs = sp.toString();
          return (
            <Link
              key={p}
              href={qs ? `/games?${qs}` : "/games"}
              className={`rounded border px-3 py-1 text-sm ${
                p === page ? "border-sky-600 bg-sky-50 font-semibold text-sky-800" : "border-slate-300"
              }`}
            >
              {p}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
