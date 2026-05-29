import { getAscendingPitches } from "@/lib/piano/pitch";
import type {
  CommonProgression,
  HintReferenceRow,
  IntroProgressionId,
  LessonChallengeDefinition,
  LessonDefinition,
  ProgressionStep,
  ResolvedChallenge,
  ScaleNumber,
  ScalePlaybackNote,
  TriadPlayback,
} from "@/lib/lessons/types";

const SCALE_NUMBERS: ScaleNumber[] = ["1", "2", "3", "4", "5", "6", "7"];
const MINOR_TRIAD_DEGREES = new Set<ScaleNumber>(["2", "3", "6"]);

export const INTRO_PROGRESSION_IDS: IntroProgressionId[] = [
  "1-4-5",
  "1-5-6-4",
  "2-5-1",
  "6-4-1-5",
];

const INTRO_PROGRESSION_DEGREES: Record<IntroProgressionId, ScaleNumber[]> = {
  "1-4-5": ["1", "4", "5"],
  "1-5-6-4": ["1", "5", "6", "4"],
  "2-5-1": ["2", "5", "1"],
  "6-4-1-5": ["6", "4", "1", "5"],
};

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

export function getIntroExplanation(lesson: LessonDefinition): string {
  if (lesson.introExplanation) return lesson.introExplanation;

  const notes = lesson.scale.join(", ");
  const root = lesson.numbers["1"];
  const four = lesson.numbers["4"];
  const five = lesson.numbers["5"];

  return `${lesson.title} uses the notes ${notes}. In Nashville Numbers, ${root} is 1, ${four} is 4, and ${five} is 5. These numbers help you understand songs and move them to other keys.`;
}

export function getIntroSummary(lesson: LessonDefinition): string {
  const one = lesson.numbers["1"];
  const four = lesson.numbers["4"];
  const five = lesson.numbers["5"];
  const mapping = `${one} is 1, ${four} is 4, and ${five} is 5.`;

  if (lesson.keyId === "C") {
    return `No sharps or flats. ${mapping}`;
  }

  return mapping;
}

export function getScaleKeyIds(lesson: LessonDefinition): string[] {
  return getScalePlayback(lesson).map((entry) => entry.keyId);
}

export function getScalePlayback(
  lesson: LessonDefinition,
): ScalePlaybackNote[] {
  const pitches = getAscendingPitches(lesson.scale);

  return lesson.scale
    .map((note, index) => {
      const keyId = lesson.noteToKeyId[note];
      if (!keyId) return null;
      return {
        note,
        pitch: pitches[index],
        keyId,
      };
    })
    .filter((entry): entry is ScalePlaybackNote => Boolean(entry));
}

export function getTriadLabel(
  lesson: LessonDefinition,
  degree: ScaleNumber,
): string {
  const note = lesson.numbers[degree];
  if (degree === "7") return `${note} dim`;
  if (MINOR_TRIAD_DEGREES.has(degree)) return `${note} minor`;
  return note;
}

export function getDiatonicTriadNotes(
  lesson: LessonDefinition,
  degree: ScaleNumber,
): string[] {
  const rootIdx = SCALE_NUMBERS.indexOf(degree);
  return [
    lesson.numbers[SCALE_NUMBERS[rootIdx]],
    lesson.numbers[SCALE_NUMBERS[(rootIdx + 2) % 7]],
    lesson.numbers[SCALE_NUMBERS[(rootIdx + 4) % 7]],
  ];
}

export function getTriadKeyIds(
  lesson: LessonDefinition,
  degree: ScaleNumber,
): string[] {
  return getTriadPlayback(lesson, degree).keyIds;
}

export function getTriadPlayback(
  lesson: LessonDefinition,
  degree: ScaleNumber,
): TriadPlayback {
  const notes = getDiatonicTriadNotes(lesson, degree);
  const pitches = getAscendingPitches(notes);
  const keyIds = notes
    .map((note) => lesson.noteToKeyId[note])
    .filter((keyId): keyId is string => Boolean(keyId));

  return { pitches, keyIds };
}

export function getAllTriadsPlayback(
  lesson: LessonDefinition,
): Record<ScaleNumber, TriadPlayback> {
  return Object.fromEntries(
    SCALE_NUMBERS.map((degree) => [degree, getTriadPlayback(lesson, degree)]),
  ) as Record<ScaleNumber, TriadPlayback>;
}

export function getChordNotes(
  lesson: LessonDefinition,
  root: "1" | "4" | "5",
): string[] {
  return getDiatonicTriadNotes(lesson, root);
}

export function getChordKeyIds(
  lesson: LessonDefinition,
  root: "1" | "4" | "5",
): string[] {
  return getTriadKeyIds(lesson, root);
}

export function getLessonChordsByNumber(
  lesson: LessonDefinition,
): Record<"1" | "4" | "5", string[]> {
  return {
    "1": getChordKeyIds(lesson, "1"),
    "4": getChordKeyIds(lesson, "4"),
    "5": getChordKeyIds(lesson, "5"),
  };
}

function buildProgressionSteps(
  lesson: LessonDefinition,
  degrees: ScaleNumber[],
): ProgressionStep[] {
  return degrees.map((number) => {
    const playback = getTriadPlayback(lesson, number);
    return {
      number,
      label: getTriadLabel(lesson, number),
      keyIds: playback.keyIds,
      pitches: playback.pitches,
    };
  });
}

export function getIntroProgression(
  lesson: LessonDefinition,
  id: IntroProgressionId,
): CommonProgression {
  const degrees = INTRO_PROGRESSION_DEGREES[id];
  const steps = buildProgressionSteps(lesson, degrees);

  return {
    id,
    numbersLabel: degrees.join(" - "),
    chordsLabel: steps.map((step) => step.label).join(" - "),
    steps,
  };
}

export function getIntroProgressions(
  lesson: LessonDefinition,
): Record<IntroProgressionId, CommonProgression> {
  return Object.fromEntries(
    INTRO_PROGRESSION_IDS.map((id) => [id, getIntroProgression(lesson, id)]),
  ) as Record<IntroProgressionId, CommonProgression>;
}

export function getIntroProgressionPlaybacks(
  lesson: LessonDefinition,
): Record<IntroProgressionId, TriadPlayback[]> {
  return Object.fromEntries(
    INTRO_PROGRESSION_IDS.map((id) => [
      id,
      getIntroProgression(lesson, id).steps.map((step) => ({
        pitches: step.pitches,
        keyIds: step.keyIds,
      })),
    ]),
  ) as Record<IntroProgressionId, TriadPlayback[]>;
}

/** @deprecated Use getIntroProgression(lesson, "1-5-6-4") */
export function getCommonProgression1564(
  lesson: LessonDefinition,
): CommonProgression {
  return getIntroProgression(lesson, "1-5-6-4");
}

/** @deprecated Use getIntroProgressionPlaybacks */
export function getCommonProgressionKeyIds(
  lesson: LessonDefinition,
): string[][] {
  return getIntroProgression(lesson, "1-5-6-4").steps.map((step) => step.keyIds);
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
