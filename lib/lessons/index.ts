export type {
  FindNoteChallenge,
  FindNumberChallenge,
  HearAndIdentifyChallenge,
  HintReferenceRow,
  LessonChallengeDefinition,
  LessonDefinition,
  LessonNumbers,
  MultipleChoiceChallenge,
  ResolvedChallenge,
  ScaleNumber,
} from "@/lib/lessons/types";

export {
  acceptsPianoNote,
  answerFromPianoNote,
  getCorrectFeedback,
  getHintReference,
  getNoteToNumber,
  getNumberToNote,
  getWrongFeedback,
  noteForAnswer,
  resolveChallenge,
  resolveLessonChallenges,
} from "@/lib/lessons/engine";

export { cMajorLesson } from "@/lib/lessons/data/c-major";
export { dMajorLesson } from "@/lib/lessons/data/d-major";
export { gMajorLesson } from "@/lib/lessons/data/g-major";
export {
  getLessonById,
  getLessonByKeyId,
  getLessonIdByKeyId,
  lessons,
  type LessonId,
} from "@/lib/lessons/registry";
