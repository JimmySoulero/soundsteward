import {
  FEEDBACK_STORAGE_KEY,
  LEGACY_FEEDBACK_STORAGE_KEY,
} from "@/lib/feedback/constants";
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

function normalizeSubmission(raw: unknown): FeedbackSubmission | null {
  if (typeof raw !== "object" || raw === null) return null;

  const item = raw as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    typeof item.type !== "string" ||
    typeof item.message !== "string" ||
    typeof item.createdAt !== "string"
  ) {
    return null;
  }

  const metadata =
    typeof item.metadata === "object" && item.metadata !== null
      ? (item.metadata as Record<string, unknown>)
      : null;

  return {
    id: item.id,
    type: item.type as FeedbackSubmission["type"],
    message: item.message,
    email: typeof item.email === "string" ? item.email : null,
    page:
      typeof item.page === "string"
        ? item.page
        : typeof item.pageUrl === "string"
          ? item.pageUrl
          : null,
    createdAt: item.createdAt,
    userAgent:
      typeof item.userAgent === "string"
        ? item.userAgent
        : typeof metadata?.userAgent === "string"
          ? metadata.userAgent
          : null,
  };
}

function parseSubmissions(raw: string | null): FeedbackSubmission[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeSubmission)
      .filter((item): item is FeedbackSubmission => item !== null);
  } catch {
    return [];
  }
}

function migrateLegacyStorage(): FeedbackSubmission[] {
  if (typeof window === "undefined") return [];

  const legacy = parseSubmissions(
    localStorage.getItem(LEGACY_FEEDBACK_STORAGE_KEY),
  );
  if (legacy.length === 0) return [];

  const current = parseSubmissions(localStorage.getItem(FEEDBACK_STORAGE_KEY));
  const merged = [...current];
  for (const item of legacy) {
    if (!merged.some((entry) => entry.id === item.id)) {
      merged.push(item);
    }
  }

  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(merged));
  localStorage.removeItem(LEGACY_FEEDBACK_STORAGE_KEY);
  return merged;
}

export function getFeedbackSubmissions(): FeedbackSubmission[] {
  if (typeof window === "undefined") return [];

  const current = parseSubmissions(localStorage.getItem(FEEDBACK_STORAGE_KEY));
  if (current.length > 0) return current;

  return migrateLegacyStorage();
}

export function saveFeedbackSubmission(
  input: CreateFeedbackInput,
): FeedbackSubmission {
  const submission: FeedbackSubmission = {
    id: generateId(),
    type: input.type,
    message: input.message.trim(),
    email: input.email?.trim() || null,
    page: input.page ?? null,
    createdAt: new Date().toISOString(),
    userAgent: input.userAgent ?? null,
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

export function clearFeedbackSubmissions(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FEEDBACK_STORAGE_KEY);
  localStorage.removeItem(LEGACY_FEEDBACK_STORAGE_KEY);
}
