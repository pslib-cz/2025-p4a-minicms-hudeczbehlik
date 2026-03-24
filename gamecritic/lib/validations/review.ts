import { ReviewStatus } from "@prisma/client";
import { z } from "zod";

export const reviewFormSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: z.string().trim().min(3).max(180).optional(),
  content: z.string().trim().min(20),
  score: z.coerce.number().int().min(1).max(10),
  status: z.nativeEnum(ReviewStatus),
  publishDate: z.coerce.date().nullable().optional(),
  gameId: z.string().cuid(),
});

export type ReviewSchemaInput = z.input<typeof reviewFormSchema>;
export type ReviewSchemaOutput = z.output<typeof reviewFormSchema>;
