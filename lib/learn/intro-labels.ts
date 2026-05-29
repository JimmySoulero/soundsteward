import type { LessonDefinition, ScaleNumber } from "@/lib/lessons/types";

const MINOR_DEGREES = new Set<ScaleNumber>(["2", "3", "6"]);

export function getTriadShortLabel(
  lesson: LessonDefinition,
  degree: ScaleNumber,
): string {
  const note = lesson.numbers[degree];
  if (degree === "7") return `${note}dim`;
  if (MINOR_DEGREES.has(degree)) return `${note}m`;
  return note;
}

export function formatChordsWithArrows(labels: string[]): string {
  return labels.join(" → ");
}

export function shortenChordLabel(label: string): string {
  if (label.endsWith(" minor")) return `${label.slice(0, -6)}m`;
  if (label.endsWith(" dim")) return `${label.slice(0, -4)}dim`;
  return label;
}

export function formatProgressionPreview(
  steps: readonly { label: string }[],
): string {
  return formatChordsWithArrows(steps.map((step) => shortenChordLabel(step.label)));
}
