export const FEEDBACK_TYPES = [
  "bug",
  "feature",
  "lesson",
  "general",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

/** Shape mirrors a future Supabase `feedback_submissions` row */
export type FeedbackSubmission = {
  id: string;
  type: FeedbackType;
  message: string;
  email: string | null;
  createdAt: string;
  pageUrl: string | null;
  metadata: FeedbackMetadata;
};

export type FeedbackMetadata = {
  userAgent: string | null;
};

export type CreateFeedbackInput = {
  type: FeedbackType;
  message: string;
  email?: string | null;
  pageUrl?: string | null;
  metadata?: Partial<FeedbackMetadata>;
};
