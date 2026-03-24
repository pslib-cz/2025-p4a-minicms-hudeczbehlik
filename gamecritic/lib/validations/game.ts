import { z } from "zod";

export const gameFormSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  releaseYear: z
    .union([z.coerce.number().int().min(1950).max(2100), z.null()])
    .optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  genreIds: z.array(z.string().cuid()).default([]),
  tagIds: z.array(z.string().cuid()).default([]),
  newTags: z.array(z.string().trim().min(2).max(40)).default([]),
});

export type GameSchemaInput = z.input<typeof gameFormSchema>;
export type GameSchemaOutput = z.output<typeof gameFormSchema>;
