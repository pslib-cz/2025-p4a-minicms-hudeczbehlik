"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

import { deleteScreenshot, uploadScreenshot } from "@/app/actions/screenshots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GameOption = {
  id: string;
  title: string;
};

type ScreenshotItem = {
  id: string;
  url: string;
  caption: string | null;
  game: { title: string; slug: string };
};

type Props = {
  games: GameOption[];
  screenshots: ScreenshotItem[];
};

export function ScreenshotManager({ games, screenshots }: Props) {
  const [pending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    gameId: games[0]?.id ?? "",
    url: "",
    caption: "",
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-slate-900">Upload screenshot</h2>
        <p className="mt-1 text-sm text-slate-600">Uploadthing/Cloudinary URL can be pasted below.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <select
            value={formState.gameId}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, gameId: event.target.value }))
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            ))}
          </select>

          <Input
            value={formState.url}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, url: event.target.value }))
            }
            placeholder="https://..."
          />

          <Input
            value={formState.caption}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, caption: event.target.value }))
            }
            placeholder="Caption"
          />

          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await uploadScreenshot(
                  formState.gameId,
                  formState.url,
                  formState.caption || undefined,
                );

                if (!result.success) {
                  alert(result.error);
                  return;
                }

                setFormState((prev) => ({ ...prev, url: "", caption: "" }));
              });
            }}
          >
            Upload
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {screenshots.map((shot) => (
          <article key={shot.id} className="overflow-hidden rounded-xl bg-white shadow">
            <div className="relative aspect-video w-full">
              <Image
                src={shot.url}
                alt={shot.caption || `Screenshot from ${shot.game.title}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2 p-4">
              <p className="text-sm font-medium text-slate-900">{shot.game.title}</p>
              {shot.caption ? (
                <p className="text-sm text-slate-700">{shot.caption}</p>
              ) : null}
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  startTransition(async () => {
                    await deleteScreenshot(shot.id);
                  });
                }}
              >
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
