"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { createGame } from "@/app/actions/games";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gameFormSchema, type GameSchemaInput } from "@/lib/validations/game";

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
      const result = await createGame(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/games/${result.data.slug}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-xl bg-white p-6 shadow">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input {...form.register("title")} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Slug (optional)</label>
        <Input {...form.register("slug")} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          {...form.register("description")}
          className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Release Year</label>
          <Input type="number" {...form.register("releaseYear", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Image URL</label>
          <Input type="url" {...form.register("coverImage")} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Genres</label>
        <div className="grid gap-2 md:grid-cols-3">
          {genres.map((genre) => (
            <label key={genre.id} className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm">
              <input type="checkbox" value={genre.id} {...form.register("genreIds")} />
              {genre.name}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Existing Tags</label>
        <div className="grid gap-2 md:grid-cols-3">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm">
              <input type="checkbox" value={tag.id} {...form.register("tagIds")} />
              {tag.name}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Create Tags Inline</label>
        <div className="flex gap-2">
          <Input
            value={newTagInput}
            onChange={(event) => setNewTagInput(event.target.value)}
            placeholder="e.g. Indie Gem"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const trimmed = newTagInput.trim();
              if (!trimmed) return;
              setInlineTags((prev) => [...new Set([...prev, trimmed])]);
              setNewTagInput("");
            }}
          >
            Add
          </Button>
        </div>
        <p className="text-sm text-slate-600">{inlineTags.join(", ")}</p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create game"}
      </Button>
    </form>
  );
}
