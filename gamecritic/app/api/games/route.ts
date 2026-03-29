import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { gameFormSchema } from "@/lib/validations/game";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/utils/slug";
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

  const parsed = gameFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
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
        create: { name: tagName, slug: tagSlug },
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
      addedById: session.user.id,
      genres: { connect: input.genreIds.map((id) => ({ id })) },
      tags: { connect: connectedTagIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/games");
  revalidatePath(`/games/${slug}`);
  revalidatePath("/dashboard/games/new");
  revalidateTag("games", "max");

  return NextResponse.json({ success: true, data: { slug } }, { status: 201 });
}
