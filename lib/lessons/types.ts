export type ScaleNumber = "1" | "2" | "3" | "4" | "5" | "6" | "7";

export type LessonNumbers = Record<ScaleNumber, string>;

export type LessonDefinition = {
  id: string;
  keyId: string;
  title: string;
  scale: readonly string[];
  numbers: LessonNumbers;
  noteToKeyId: Record<string, string>;
  completionMessage: string;
  nextLessonLabel?: string;
  challenges: LessonChallengeDefinition[];
};

type ChallengeBase = {
  id: string;
  answer: string;
  choices: readonly string[];
};

/** Tap the scale degree on the piano or pick the matching note */
export type FindNumberChallenge = ChallengeBase & {
  type: "findNumber";
  number: ScaleNumber;
  prompt?: string;
};

/** Identify which note corresponds to a scale degree */
export type FindNoteChallenge = ChallengeBase & {
  type: "findNote";
  number: ScaleNumber;
  prompt?: string;
};

/** Generic multiple-choice — use pianoAnswerMode for piano input mapping */
export type MultipleChoiceChallenge = ChallengeBase & {
  type: "multipleChoice";
  prompt: string;
  pianoAnswerMode?: "note" | "number" | "none";
  /** Used in feedback when identifying a note's number */
  note?: string;
};

/** Play a note and identify it by ear */
export type HearAndIdentifyChallenge = ChallengeBase & {
  type: "hearAndIdentify";
  noteToPlay: string;
  prompt?: string;
  pianoAnswerMode?: "note" | "number" | "none";
};

export type LessonChallengeDefinition =
  | FindNumberChallenge
  | FindNoteChallenge
  | MultipleChoiceChallenge
  | HearAndIdentifyChallenge;

export type ResolvedChallenge = {
  id: string;
  type: LessonChallengeDefinition["type"];
  prompt: string;
  answer: string;
  choices: readonly string[];
  pianoAnswerMode: "note" | "number" | "none";
  audioNote?: string;
  number?: ScaleNumber;
  note?: string;
};

export type HintReferenceRow = {
  number: ScaleNumber;
  note: string;
};
