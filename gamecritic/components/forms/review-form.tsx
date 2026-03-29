"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
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
    <Form onSubmit={form.handleSubmit(onSubmit)} className="rounded bg-white p-4 shadow-sm space-y-4">
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Název</Form.Label>
            <Form.Control {...form.register("title")} placeholder="Název recenze" />
            {fieldErrors?.title ? (
              <Form.Text className="text-danger d-block">{fieldErrors.title.join(", ")}</Form.Text>
            ) : null}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-3" controlId="slug">
            <Form.Label>Slug (volitelné)</Form.Label>
            <Form.Control {...form.register("slug")} placeholder="auto-generováno z názvu" />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-3" controlId="gameId">
            <Form.Label>Hra</Form.Label>
            <Form.Select {...form.register("gameId")}>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-3" controlId="score">
            <Form.Label>Skóre: {scoreValue}</Form.Label>
            <Form.Range min={1} max={10} step={1} {...form.register("score", { valueAsNumber: true })} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="status">
            <Form.Label>Stav</Form.Label>
            <Form.Select {...form.register("status")}>
              <option value={REVIEW_STATUS.DRAFT}>DRAFT</option>
              <option value={REVIEW_STATUS.PUBLISHED}>PUBLISHED</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="publishDate">
            <Form.Label>Datum publikace</Form.Label>
            <Form.Control type="datetime-local" {...form.register("publishDate")} />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="content">
        <Form.Label>Obsah</Form.Label>
        <Controller
          control={form.control}
          name="content"
          render={({ field }) => (
            <TiptapEditor value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
        {fieldErrors?.content ? (
          <Form.Text className="text-danger d-block">{fieldErrors.content.join(", ")}</Form.Text>
        ) : null}
      </Form.Group>

      {error ? <p className="text-danger small">{error}</p> : null}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Ukládám…" : reviewId ? "Uložit změny" : "Vytvořit recenzi"}
      </Button>
    </Form>
  );
}
