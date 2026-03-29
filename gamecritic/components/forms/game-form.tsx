"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
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
    <Form onSubmit={form.handleSubmit(onSubmit)} className="rounded bg-white p-4 shadow-sm">
      <Form.Group className="mb-3" controlId="game-title">
        <Form.Label>Název hry</Form.Label>
        <Form.Control {...form.register("title")} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="game-slug">
        <Form.Label>Slug (volitelné)</Form.Label>
        <Form.Control {...form.register("slug")} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="game-desc">
        <Form.Label>Popis</Form.Label>
        <Form.Control as="textarea" rows={4} {...form.register("description")} />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="release-year">
            <Form.Label>Rok vydání</Form.Label>
            <Form.Control type="number" {...form.register("releaseYear", { valueAsNumber: true })} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="cover">
            <Form.Label>URL obrázku obalu</Form.Label>
            <Form.Control type="url" {...form.register("coverImage")} />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Žánry</Form.Label>
        <div className="row row-cols-1 row-cols-md-3 g-2">
          {genres.map((genre) => (
            <Col key={genre.id}>
              <Form.Check
                type="checkbox"
                id={`genre-${genre.id}`}
                label={genre.name}
                value={genre.id}
                {...form.register("genreIds")}
              />
            </Col>
          ))}
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Tagy</Form.Label>
        <div className="row row-cols-1 row-cols-md-3 g-2">
          {tags.map((tag) => (
            <Col key={tag.id}>
              <Form.Check
                type="checkbox"
                id={`tag-${tag.id}`}
                label={tag.name}
                value={tag.id}
                {...form.register("tagIds")}
              />
            </Col>
          ))}
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Nové tagy (oddělené přidáním)</Form.Label>
        <div className="d-flex gap-2 flex-wrap">
          <Form.Control
            value={newTagInput}
            onChange={(event) => setNewTagInput(event.target.value)}
            placeholder="např. Soulslike"
          />
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => {
              const trimmed = newTagInput.trim();
              if (!trimmed) return;
              setInlineTags((prev) => [...new Set([...prev, trimmed])]);
              setNewTagInput("");
            }}
          >
            Přidat
          </Button>
        </div>
        {inlineTags.length > 0 ? (
          <Form.Text className="text-muted d-block mt-2">{inlineTags.join(", ")}</Form.Text>
        ) : null}
      </Form.Group>

      {error ? <p className="text-danger small">{error}</p> : null}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Ukládám…" : "Vytvořit hru"}
      </Button>
    </Form>
  );
}
