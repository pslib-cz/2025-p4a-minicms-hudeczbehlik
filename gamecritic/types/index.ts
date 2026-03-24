import type { ReviewStatusValue } from "@/types/review-status";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type ReviewFormData = {
  title: string;
  slug?: string;
  content: string;
  score: number;
  status: ReviewStatusValue;
  publishDate?: Date | null;
  gameId: string;
};

export type GameFormData = {
  title: string;
  slug?: string;
  description?: string;
  releaseYear?: number | null;
  coverImage?: string;
  genreIds: string[];
  tagIds: string[];
  newTags?: string[];
};

export type CatalogSearchParams = {
  genre?: string | string[];
  tag?: string | string[];
  q?: string;
  page?: string;
};
