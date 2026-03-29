import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { screenshotUploadSchema } from "@/lib/validations/screenshot";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = screenshotUploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  await prisma.screenshot.create({
    data: {
      gameId: parsed.data.gameId,
      url: parsed.data.url,
      caption: parsed.data.caption,
      userId: session.user.id,
    },
  });

  const game = await prisma.game.findUnique({
    where: { id: parsed.data.gameId },
    select: { slug: true },
  });

  revalidatePath("/dashboard/screenshots");
  if (game?.slug) {
    revalidatePath(`/games/${game.slug}`);
  }
  revalidateTag("screenshots", "max");

  return NextResponse.json({ success: true }, { status: 201 });
}
