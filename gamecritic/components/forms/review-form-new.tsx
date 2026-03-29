"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { TiptapEditor } from "@/components/forms/tiptap-editor";
import {
  reviewFormSchema,
  type ReviewSchemaInput,
} from "@/lib/validations/review";
import { REVIEW_STATUS } from "@/types/review-status";
import type { ActionResult } from "@/types";

type GameOption = {
  id: string;
  title: string;
};

type Props = {
  games: GameOption[];
  reviewId?: string;
  defaultValues?: Partial<ReviewSchemaInput>;
};

function buildJsonPayload(values: ReviewSchemaInput): Record<string, unknown> {
  let publishDate: string | null = null;
  if (values.publishDate) {
    const d =
      values.publishDate instanceof Date
        ? values.publishDate
        : new Date(values.publishDate as unknown as string);
    publishDate = Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  return {
    title: values.title,
    slug: values.slug?.trim() ? values.slug : undefined,
    content: values.content,
    score: values.score,
    status: values.status,
    gameId: values.gameId,
    publishDate,
  };
}

export function ReviewForm({ games, reviewId, defaultValues }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();
  const router = useRouter();

  const form = useForm<ReviewSchemaInput>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      content: defaultValues?.content ?? "<p>Write your review...</p>",
      score: defaultValues?.score ?? 7,
      status: defaultValues?.status ?? REVIEW_STATUS.DRAFT,
      publishDate: defaultValues?.publishDate,
      gameId: defaultValues?.gameId ?? games[0]?.id,
    },
  });

  const score = useWatch({ control: form.control, name: "score" });
  const scoreValue = typeof score === "number" ? score : 1;

  const onSubmit = (values: ReviewSchemaInput) => {
    setError(null);
    setFieldErrors(undefined);

    const payload = buildJsonPayload({
      ...values,
      score:
        typeof values.score === "number" && Number.isFinite(values.score)
          ? values.score
          : 1,
    });

    startTransition(async () => {
      const url = reviewId ? `/api/reviews/${reviewId}` : "/api/reviews";
      const method = reviewId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ActionResult<{ slug: string } | void>;

      if (!json.success) {
        setError(json.error);
        if ("fieldErrors" in json && json.fieldErrors) {
          setFieldErrors(json.fieldErrors);
        }
        return;
      }

      router.push("/dashboard/reviews");
      router.refresh();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg bg-gradient-to-br from-gray-900 to-black p-6 shadow-xl border border-orange-600/30 space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-orange-400 mb-2">
          Název
        </label>
        <input
          id="title"
          {...form.register("title")}
          placeholder="Název recenze"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
        {fieldErrors?.title ? (
          <p className="text-red-400 text-sm mt-1">{fieldErrors.title.join(", ")}</p>
        ) : null}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-orange-400 mb-2">
          Slug (volitelné)
        </label>
        <input
          id="slug"
          {...form.register("slug")}
          placeholder="auto-generováno z názvu"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Game Selection */}
      <div>
        <label htmlFor="gameId" className="block text-sm font-medium text-orange-400 mb-2">
          Hra
        </label>
        <select
          id="gameId"
          {...form.register("gameId")}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        >
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.title}
            </option>
          ))}
        </select>
      </div>

      {/* Score Range */}
      <div>
        <label htmlFor="score" className="block text-sm font-medium text-orange-400 mb-2">
          Skóre: {scoreValue}
        </label>
        <input
          id="score"
          type="range"
          min="1"
          max="10"
          step="1"
          {...form.register("score", { valueAsNumber: true })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      {/* Status and Publish Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-orange-400 mb-2">
            Stav
          </label>
          <select
            id="status"
            {...form.register("status")}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            <option value={REVIEW_STATUS.DRAFT}>DRAFT</option>
            <option value={REVIEW_STATUS.PUBLISHED}>PUBLISHED</option>
          </select>
        </div>
        <div>
          <label htmlFor="publishDate" className="block text-sm font-medium text-orange-400 mb-2">
            Datum publikace
          </label>
          <input
            id="publishDate"
            type="datetime-local"
            {...form.register("publishDate")}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-orange-400 mb-2">
          Obsah
        </label>
        <Controller
          control={form.control}
          name="content"
          render={({ field }) => (
            <TiptapEditor value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
        {fieldErrors?.content ? (
          <p className="text-red-400 text-sm mt-1">{fieldErrors.content.join(", ")}</p>
        ) : null}
      </div>

      {/* Error Message */}
      {error ? <p className="text-red-400 text-sm">{error}</p> : null}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Ukládám…" : reviewId ? "Uložit změny" : "Vytvořit recenzi"}
      </button>
    </form>
  );
}
