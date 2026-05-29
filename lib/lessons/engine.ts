import type {
  HintReferenceRow,
  LessonChallengeDefinition,
  LessonDefinition,
  ResolvedChallenge,
  ScaleNumber,
} from "@/lib/lessons/types";

const SCALE_NUMBERS: ScaleNumber[] = ["1", "2", "3", "4", "5", "6", "7"];

export function getNoteToNumber(
  lesson: LessonDefinition,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const number of SCALE_NUMBERS) {
    map[lesson.numbers[number]] = number;
  }
  return map;
}

export function getNumberToNote(lesson: LessonDefinition): Record<string, string> {
  return { ...lesson.numbers };
}

export function getHintReference(lesson: LessonDefinition): HintReferenceRow[] {
  return SCALE_NUMBERS.map((number) => ({
    number,
    note: lesson.numbers[number],
  }));
}

export function resolveChallenge(
  lesson: LessonDefinition,
  challenge: LessonChallengeDefinition,
): ResolvedChallenge {
  switch (challenge.type) {
    case "findNumber":
      return {
        id: challenge.id,
        type: challenge.type,
        prompt:
          challenge.prompt ??
          `Tap the ${challenge.number} in ${lesson.title}`,
        answer: challenge.answer,
        choices: challenge.choices,
        pianoAnswerMode: "note",
        number: challenge.number,
      };
    case "findNote":
      return {
        id: challenge.id,
        type: challenge.type,
        prompt:
          challenge.prompt ?? `What note is the ${challenge.number}?`,
        answer: challenge.answer,
        choices: challenge.choices,
        pianoAnswerMode: "note",
        number: challenge.number,
      };
    case "multipleChoice":
      return {
        id: challenge.id,
        type: challenge.type,
        prompt: challenge.prompt,
        answer: challenge.answer,
        choices: challenge.choices,
        pianoAnswerMode: challenge.pianoAnswerMode ?? "none",
        note: challenge.note,
      };
    case "hearAndIdentify":
      return {
        id: challenge.id,
        type: challenge.type,
        prompt:
          challenge.prompt ??
          `What ${challenge.pianoAnswerMode === "number" ? "number" : "note"} did you hear?`,
        answer: challenge.answer,
        choices: challenge.choices,
        pianoAnswerMode: challenge.pianoAnswerMode ?? "note",
        audioNote: challenge.noteToPlay,
      };
  }
}

export function resolveLessonChallenges(
  lesson: LessonDefinition,
): ResolvedChallenge[] {
  return lesson.challenges.map((challenge) => resolveChallenge(lesson, challenge));
}

export function answerFromPianoNote(
  lesson: LessonDefinition,
  challenge: ResolvedChallenge,
  note: string,
): string {
  if (challenge.pianoAnswerMode === "number") {
    return getNoteToNumber(lesson)[note] ?? note;
  }
  if (challenge.pianoAnswerMode === "note") {
    return note;
  }
  return note;
}

export function noteForAnswer(
  lesson: LessonDefinition,
  challenge: ResolvedChallenge,
  answer: string,
): string {
  if (challenge.pianoAnswerMode === "number") {
    return lesson.numbers[answer as ScaleNumber] ?? answer;
  }
  return answer;
}

export function acceptsPianoNote(
  lesson: LessonDefinition,
  challenge: ResolvedChallenge,
  note: string,
): boolean {
  if (challenge.pianoAnswerMode === "none") return false;
  return lesson.scale.includes(note);
}

export function getWrongFeedback(
  lesson: LessonDefinition,
  challenge: ResolvedChallenge,
): string {
  switch (challenge.type) {
    case "findNumber":
      return `In ${lesson.title.toLowerCase()}, ${challenge.number} is ${challenge.answer}. Try again.`;
    case "findNote":
      return `The ${challenge.number} is ${challenge.answer}. Try again.`;
    case "multipleChoice":
      if (challenge.note) {
        return `${challenge.note} is ${challenge.answer} in ${lesson.title.toLowerCase()}. Try again.`;
      }
      return `The answer is ${challenge.answer}. Try again.`;
    case "hearAndIdentify":
      return `That note is ${challenge.answer}. Try again.`;
  }
}

export function getCorrectFeedback(
  lesson: LessonDefinition,
  challenge: ResolvedChallenge,
): string {
  switch (challenge.type) {
    case "findNumber":
      return `✓ ${challenge.number} is ${challenge.answer}`;
    case "findNote":
      return `✓ The ${challenge.number} is ${challenge.answer}`;
    case "multipleChoice":
      if (challenge.note) {
        return `✓ ${challenge.note} is ${challenge.answer}`;
      }
      return `✓ ${challenge.answer}`;
    case "hearAndIdentify":
      return `✓ ${challenge.answer}`;
  }
}
