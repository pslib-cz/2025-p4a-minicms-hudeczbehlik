export const REVIEW_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type ReviewStatusValue =
  (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];
