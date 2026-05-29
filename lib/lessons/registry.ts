import { cMajorLesson } from "@/lib/lessons/data/c-major";
import { gMajorLesson } from "@/lib/lessons/data/g-major";
import type { LessonDefinition } from "@/lib/lessons/types";

export const lessons = {
  cMajor: cMajorLesson,
  gMajor: gMajorLesson,
} as const satisfies Record<string, LessonDefinition>;

export type LessonId = keyof typeof lessons;

export function getLessonById(id: LessonId): LessonDefinition {
  return lessons[id];
}

export function getLessonByKeyId(keyId: string): LessonDefinition | undefined {
  return Object.values(lessons).find((lesson) => lesson.keyId === keyId);
}

export function getLessonIdByKeyId(keyId: string): LessonId | undefined {
  const entry = Object.entries(lessons).find(
    ([, lesson]) => lesson.keyId === keyId,
  );
  return entry?.[0] as LessonId | undefined;
}
