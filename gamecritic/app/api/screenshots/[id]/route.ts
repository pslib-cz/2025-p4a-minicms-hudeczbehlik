import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.screenshot.findFirst({
    where: { id, userId: session.user.id },
    include: { game: { select: { slug: true } } },
  });

  if (!existing) {
    return NextResponse.json({ success: false, error: "Screenshot not found" }, { status: 404 });
  }

  await prisma.screenshot.delete({
    where: { id: existing.id },
  });

  revalidatePath("/dashboard/screenshots");
  revalidatePath(`/games/${existing.game.slug}`);
  revalidateTag("screenshots", "max");

  return NextResponse.json({ success: true });
}
