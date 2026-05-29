import type { FeedbackType } from "@/lib/feedback/types";

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  bug: "Bug Report",
  feature: "Feature Request",
  lesson: "Lesson Feedback",
  general: "General Feedback",
};

export const FEEDBACK_STORAGE_KEY = "soundsteward_feedback";

/** @deprecated Previous localStorage key — migrated on read */
export const LEGACY_FEEDBACK_STORAGE_KEY = "soundsteward-feedback";
