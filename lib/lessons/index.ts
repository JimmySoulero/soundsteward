export type {
  CommonProgression,
  FindNoteChallenge,
  FindNumberChallenge,
  HearAndIdentifyChallenge,
  HintReferenceRow,
  IntroProgressionId,
  LessonChallengeDefinition,
  LessonDefinition,
  LessonNumbers,
  MultipleChoiceChallenge,
  ProgressionStep,
  ResolvedChallenge,
  ScaleNumber,
  ScalePlaybackNote,
  TriadPlayback,
} from "@/lib/lessons/types";

export {
  acceptsPianoNote,
  answerFromPianoNote,
  getAllTriadsPlayback,
  getChordKeyIds,
  getChordNotes,
  getCommonProgression1564,
  getCommonProgressionKeyIds,
  getCorrectFeedback,
  getDiatonicTriadNotes,
  getHintReference,
  getIntroExplanation,
  getIntroProgression,
  getIntroProgressionPlaybacks,
  getIntroProgressions,
  getIntroSummary,
  getLessonChordsByNumber,
  getNoteToNumber,
  getNumberToNote,
  getScaleKeyIds,
  getScalePlayback,
  getTriadKeyIds,
  getTriadLabel,
  getTriadPlayback,
  getWrongFeedback,
  INTRO_PROGRESSION_IDS,
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
