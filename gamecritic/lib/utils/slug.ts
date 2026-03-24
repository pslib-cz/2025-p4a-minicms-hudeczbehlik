import slugify from "slugify";
import { prisma } from "@/lib/prisma";

type SlugModel = "game" | "review" | "tag";

function makeBaseSlug(input: string) {
  return slugify(input, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export async function generateUniqueSlug(
  input: string,
  model: SlugModel,
  excludeId?: string,
) {
  const base = makeBaseSlug(input);
  let candidate = base;
  let index = 2;

  while (true) {
    if (model === "game") {
      const existing = await prisma.game.findFirst({
        where: {
          slug: candidate,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }
    }

    if (model === "review") {
      const existing = await prisma.review.findFirst({
        where: {
          slug: candidate,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }
    }

    if (model === "tag") {
      const existing = await prisma.tag.findFirst({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }
    }

    candidate = `${base}-${index}`;
    index += 1;
  }
}
