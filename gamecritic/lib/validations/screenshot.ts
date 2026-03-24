import { z } from "zod";

export const screenshotUploadSchema = z.object({
  gameId: z.string().cuid(),
  url: z.string().url(),
  caption: z.string().trim().max(160).optional(),
});

export const screenshotDeleteSchema = z.object({
  id: z.string().cuid(),
});
