"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gameFormSchema } from "@/lib/validations/game";
import { fail, ok, zodFail } from "@/lib/utils/action-result";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { ActionResult, GameFormData } from "@/types";

export async function createGame(
  data: GameFormData,
): Promise<ActionResult<{ slug: string }>> {
  try {
    const user = await requireUser();
    const parsed = gameFormSchema.safeParse(data);

    if (!parsed.success) {
      return zodFail(parsed.error);
    }

    const input = parsed.data;
    const slug = await generateUniqueSlug(
      input.slug?.length ? input.slug : input.title,
      "game",
    );

    const connectedTagIds = [...input.tagIds];

    if (input.newTags.length) {
      for (const tagName of input.newTags) {
        const tagSlug = await generateUniqueSlug(tagName, "tag");

        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: { name: tagName },
          create: {
            name: tagName,
            slug: tagSlug,
          },
          select: { id: true },
        });

        connectedTagIds.push(tag.id);
      }
    }

    await prisma.game.create({
      data: {
        title: input.title,
        slug,
        description: input.description || null,
        releaseYear: input.releaseYear || null,
        coverImage: input.coverImage || null,
        addedById: user.id,
        genres: { connect: input.genreIds.map((id) => ({ id })) },
        tags: { connect: connectedTagIds.map((id) => ({ id })) },
      },
    });

    revalidatePath("/games");
    revalidatePath(`/games/${slug}`);
    revalidatePath("/dashboard/games/new");
    revalidateTag("games", "max");

    return ok({ slug });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("Unauthorized");
    }

    return fail("Failed to create game");
  }
}

