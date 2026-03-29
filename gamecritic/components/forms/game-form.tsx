"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { gameFormSchema, type GameSchemaInput } from "@/lib/validations/game";
import type { ActionResult } from "@/types";

type Option = {
  id: string;
  name: string;
};

type Props = {
  genres: Option[];
  tags: Option[];
};

export function GameForm({ genres, tags }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState("");
  const [inlineTags, setInlineTags] = useState<string[]>([]);

  const form = useForm<GameSchemaInput>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      releaseYear: null,
      coverImage: "",
      genreIds: [],
      tagIds: [],
      newTags: [],
    },
  });

  const onSubmit = (values: GameSchemaInput) => {
    setError(null);

    const payload = {
      ...values,
      releaseYear:
        typeof values.releaseYear === "number" && Number.isFinite(values.releaseYear)
          ? values.releaseYear
          : null,
      genreIds: values.genreIds ?? [],
      tagIds: values.tagIds ?? [],
      newTags: inlineTags,
    };

    startTransition(async () => {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as ActionResult<{ slug: string }>;

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/games/${result.data.slug}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg bg-gradient-to-br from-gray-900 to-black p-6 shadow-xl border border-orange-600/30 space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="game-title" className="block text-sm font-medium text-orange-400 mb-2">
          Název hry
        </label>
        <input
          id="game-title"
          {...form.register("title")}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="game-slug" className="block text-sm font-medium text-orange-400 mb-2">
          Slug (volitelné)
        </label>
        <input
          id="game-slug"
          {...form.register("slug")}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="game-desc" className="block text-sm font-medium text-orange-400 mb-2">
          Popis
        </label>
        <textarea
          id="game-desc"
          rows={4}
          {...form.register("description")}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Release Year and Cover Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="release-year" className="block text-sm font-medium text-orange-400 mb-2">
            Rok vydání
          </label>
          <input
            id="release-year"
            type="number"
            {...form.register("releaseYear", { valueAsNumber: true })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label htmlFor="cover" className="block text-sm font-medium text-orange-400 mb-2">
            URL obrázku obalu
          </label>
          <input
            id="cover"
            type="url"
            {...form.register("coverImage")}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Genres */}
      <div>
        <label className="block text-sm font-medium text-orange-400 mb-3">Žánry</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {genres.map((genre) => (
            <label key={genre.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={genre.id}
                {...form.register("genreIds")}
                className="w-4 h-4 bg-gray-700 border border-gray-600 rounded accent-orange-500 cursor-pointer"
              />
              <span className="text-gray-300 text-sm">{genre.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-orange-400 mb-3">Tagy</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={tag.id}
                {...form.register("tagIds")}
                className="w-4 h-4 bg-gray-700 border border-gray-600 rounded accent-orange-500 cursor-pointer"
              />
              <span className="text-gray-300 text-sm">{tag.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* New Tags */}
      <div>
        <label htmlFor="new-tags" className="block text-sm font-medium text-orange-400 mb-2">
          Nové tagy (oddělené přidáním)
        </label>
        <div className="flex gap-2 flex-wrap">
          <input
            id="new-tags"
            value={newTagInput}
            onChange={(event) => setNewTagInput(event.target.value)}
            placeholder="např. Soulslike"
            className="flex-1 min-w-[200px] px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = newTagInput.trim();
              if (!trimmed) return;
              setInlineTags((prev) => [...new Set([...prev, trimmed])]);
              setNewTagInput("");
            }}
            className="px-4 py-2 border border-orange-500 text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all duration-200 font-medium text-sm"
          >
            Přidat
          </button>
        </div>
        {inlineTags.length > 0 ? (
          <p className="text-gray-400 text-sm mt-2">{inlineTags.join(", ")}</p>
        ) : null}
      </div>

      {/* Error */}
      {error ? <p className="text-red-400 text-sm">{error}</p> : null}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Ukládám…" : "Vytvořit hru"}
      </button>
    </form>
  );
}
