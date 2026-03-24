"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";

import { createReview, updateReview } from "@/app/actions/reviews";
import { TiptapEditor } from "@/components/forms/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  reviewFormSchema,
  type ReviewSchemaInput,
} from "@/lib/validations/review";
import { REVIEW_STATUS } from "@/types/review-status";

type GameOption = {
  id: string;
  title: string;
};

type Props = {
  games: GameOption[];
  reviewId?: string;
  defaultValues?: Partial<ReviewSchemaInput>;
};

export function ReviewForm({ games, reviewId, defaultValues }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
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

    const payload = {
      ...values,
      score:
        typeof values.score === "number" && Number.isFinite(values.score)
          ? values.score
          : 1,
      publishDate:
        values.publishDate instanceof Date
          ? values.publishDate
          : typeof values.publishDate === "string" ||
              typeof values.publishDate === "number"
            ? new Date(values.publishDate)
            : undefined,
    };

    startTransition(async () => {
      const result = reviewId
        ? await updateReview(reviewId, payload)
        : await createReview(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/dashboard/reviews");
      router.refresh();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-xl bg-white p-6 shadow">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800">Title</label>
        <Input {...form.register("title")} placeholder="Review title" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800">Slug (optional)</label>
        <Input {...form.register("slug")} placeholder="auto-generated-from-title" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800">Game</label>
        <select
          {...form.register("gameId")}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800">Score: {scoreValue}</label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          {...form.register("score", { valueAsNumber: true })}
          className="w-full"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Status</label>
          <select
            {...form.register("status")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value={REVIEW_STATUS.DRAFT}>DRAFT</option>
            <option value={REVIEW_STATUS.PUBLISHED}>PUBLISHED</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Publish Date</label>
          <Input type="datetime-local" {...form.register("publishDate")} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800">Content</label>
        <Controller
          control={form.control}
          name="content"
          render={({ field }) => (
            <TiptapEditor value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : reviewId ? "Update review" : "Create review"}
      </Button>
    </form>
  );
}
