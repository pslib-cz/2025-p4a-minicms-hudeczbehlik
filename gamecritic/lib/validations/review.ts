import { z } from "zod";
import { REVIEW_STATUS } from "@/types/review-status";

export const reviewFormSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: z.string().trim().min(3).max(180).optional(),
  content: z.string().trim().min(20),
  score: z.coerce.number().int().min(1).max(10),
  status: z.enum([REVIEW_STATUS.DRAFT, REVIEW_STATUS.PUBLISHED]),
  publishDate: z.coerce.date().nullable().optional(),
  gameId: z.string().cuid(),
});

export type ReviewSchemaInput = z.input<typeof reviewFormSchema>;
export type ReviewSchemaOutput = z.output<typeof reviewFormSchema>;
