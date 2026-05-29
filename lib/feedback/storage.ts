import { FEEDBACK_STORAGE_KEY } from "@/lib/feedback/constants";
import type {
  CreateFeedbackInput,
  FeedbackSubmission,
} from "@/lib/feedback/types";

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `fb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function parseSubmissions(raw: string | null): FeedbackSubmission[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is FeedbackSubmission =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as FeedbackSubmission).id === "string" &&
        typeof (item as FeedbackSubmission).type === "string" &&
        typeof (item as FeedbackSubmission).message === "string" &&
        typeof (item as FeedbackSubmission).createdAt === "string",
    );
  } catch {
    return [];
  }
}

export function getFeedbackSubmissions(): FeedbackSubmission[] {
  if (typeof window === "undefined") return [];
  return parseSubmissions(localStorage.getItem(FEEDBACK_STORAGE_KEY));
}

export function saveFeedbackSubmission(
  input: CreateFeedbackInput,
): FeedbackSubmission {
  const submission: FeedbackSubmission = {
    id: generateId(),
    type: input.type,
    message: input.message.trim(),
    email: input.email?.trim() || null,
    createdAt: new Date().toISOString(),
    pageUrl: input.pageUrl ?? null,
    metadata: {
      userAgent: input.metadata?.userAgent ?? null,
    },
  };

  const existing = getFeedbackSubmissions();
  localStorage.setItem(
    FEEDBACK_STORAGE_KEY,
    JSON.stringify([submission, ...existing]),
  );

  return submission;
}

export function getFeedbackSubmissionsNewestFirst(): FeedbackSubmission[] {
  return getFeedbackSubmissions().sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
