"use client";

import { LessonModal } from "@/components/learn/LessonModal";
import { lessons } from "@/lib/lessons/registry";

type CMajorLessonModalProps = {
  onClose: () => void;
  onComplete: () => void;
  onResetProgress: () => void;
  hasCompletedBefore: boolean;
};

/** @deprecated Use LessonModal with a lesson from the registry */
export function CMajorLessonModal(props: CMajorLessonModalProps) {
  return <LessonModal lesson={lessons.cMajor} {...props} />;
}
