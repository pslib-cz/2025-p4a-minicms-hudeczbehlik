import { z } from "zod";

export const criticCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(128),
});

export type CriticCreateInput = z.input<typeof criticCreateSchema>;
