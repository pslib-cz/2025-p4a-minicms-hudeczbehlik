"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  screenshotDeleteSchema,
  screenshotUploadSchema,
} from "@/lib/validations/screenshot";
import { fail, ok, zodFail } from "@/lib/utils/action-result";
import type { ActionResult } from "@/types";

export async function uploadScreenshot(
  gameId: string,
  url: string,
  caption?: string,
): Promise<ActionResult<void>> {
  try {
    const user = await requireUser();
    const parsed = screenshotUploadSchema.safeParse({ gameId, url, caption });

    if (!parsed.success) {
      return zodFail(parsed.error);
    }

    await prisma.screenshot.create({
      data: {
        gameId: parsed.data.gameId,
        url: parsed.data.url,
        caption: parsed.data.caption,
        userId: user.id,
      },
    });

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { slug: true },
    });

    revalidatePath("/dashboard/screenshots");
    if (game?.slug) {
      revalidatePath(`/games/${game.slug}`);
    }
    revalidateTag("screenshots", "max");

    return ok(undefined);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("Unauthorized");
    }

    return fail("Failed to upload screenshot");
  }
}

export async function deleteScreenshot(id: string): Promise<ActionResult<void>> {
  try {
    const user = await requireUser();

    const parsed = screenshotDeleteSchema.safeParse({ id });
    if (!parsed.success) {
      return zodFail(parsed.error);
    }

    const existing = await prisma.screenshot.findFirst({
      where: { id: parsed.data.id, userId: user.id },
      include: { game: { select: { slug: true } } },
    });

    if (!existing) {
      return fail("Screenshot not found");
    }

    await prisma.screenshot.delete({
      where: { id: existing.id },
    });

    revalidatePath("/dashboard/screenshots");
    revalidatePath(`/games/${existing.game.slug}`);
    revalidateTag("screenshots", "max");

    return ok(undefined);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return fail("Unauthorized");
    }

    return fail("Failed to delete screenshot");
  }
}
