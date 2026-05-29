"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PianoKeyboard,
  type PianoKeyboardHandle,
} from "@/components/landing/PianoKeyboard";
import { LessonIntroScreen } from "@/components/learn/LessonIntroScreen";
import { NumberReferenceCard } from "@/components/learn/NumberReferenceCard";
import {
  acceptsPianoNote,
  answerFromPianoNote,
  getAllTriadsPlayback,
  getCorrectFeedback,
  getHintReference,
  getIntroProgressionPlaybacks,
  getIntroProgressions,
  getLessonChordsByNumber,
  getScaleKeyIds,
  getScalePlayback,
  getWrongFeedback,
  noteForAnswer,
  resolveLessonChallenges,
} from "@/lib/lessons/engine";
import type { LessonDefinition, ResolvedChallenge } from "@/lib/lessons/types";

type LessonPhase = "menu" | "intro" | "game";

function resolveOpenPhase(completed: boolean): LessonPhase {
  return completed ? "menu" : "intro";
}

type LessonModalProps = {
  lesson: LessonDefinition;
  onClose: () => void;
  onComplete: () => void;
  onResetProgress: () => void;
  hasCompletedBefore: boolean;
};

const ADVANCE_MS = 1000;
const HINT_VISIBLE_MS = 5000;

export function LessonModal({
  lesson,
  onClose,
  onComplete,
  onResetProgress,
  hasCompletedBefore,
}: LessonModalProps) {
  const challenges = useMemo(
    () => resolveLessonChallenges(lesson),
    [lesson],
  );
  const hintReference = useMemo(() => getHintReference(lesson), [lesson]);
  const lessonScaleKeyIds = useMemo(() => getScaleKeyIds(lesson), [lesson]);
  const lessonScalePlayback = useMemo(() => getScalePlayback(lesson), [lesson]);
  const lessonChordsByNumber = useMemo(
    () => getLessonChordsByNumber(lesson),
    [lesson],
  );
  const lessonTriadsByDegree = useMemo(
    () => getAllTriadsPlayback(lesson),
    [lesson],
  );
  const introProgressions = useMemo(
    () => getIntroProgressions(lesson),
    [lesson],
  );
  const lessonProgressions = useMemo(
    () => getIntroProgressionPlaybacks(lesson),
    [lesson],
  );
  const keyNumbers = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [number, note] of Object.entries(lesson.numbers)) {
      const keyId = lesson.noteToKeyId[note];
      if (keyId) map[keyId] = number;
    }
    return map;
  }, [lesson]);
  const total = challenges.length;

  const pianoRef = useRef<PianoKeyboardHandle>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [challengeIndex, setChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"correct" | "wrong" | null>(
    null,
  );
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);
  const [showReferenceCard, setShowReferenceCard] = useState(false);
  const [hintAutoShown, setHintAutoShown] = useState(false);
  const [phase, setPhase] = useState<LessonPhase>(() =>
    resolveOpenPhase(hasCompletedBefore),
  );
  const [introShowNumbers, setIntroShowNumbers] = useState(true);

  const challenge = challenges[challengeIndex];

  const hideReferenceCard = useCallback(() => {
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = null;
    setShowReferenceCard(false);
    setHintAutoShown(false);
  }, []);

  const resetGameState = useCallback(() => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    hideReferenceCard();
    setChallengeIndex(0);
    setScore(0);
    setFeedback(null);
    setFeedbackTone(null);
    setSelectedChoice(null);
    setIsLocked(false);
    setIsComplete(false);
    setWrongAttemptCount(0);
    pianoRef.current?.clearHighlight();
  }, [hideReferenceCard]);

  useEffect(() => {
    setPhase(resolveOpenPhase(hasCompletedBefore));
    setIntroShowNumbers(true);
    resetGameState();
  }, [lesson.id, resetGameState]);

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, []);

  const showReferenceCardTemporarily = useCallback((auto = false) => {
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    setShowReferenceCard(true);
    setHintAutoShown(auto);
    hintTimeoutRef.current = setTimeout(() => {
      setShowReferenceCard(false);
      setHintAutoShown(false);
      hintTimeoutRef.current = null;
    }, HINT_VISIBLE_MS);
  }, []);

  useEffect(() => {
    setWrongAttemptCount(0);
    hideReferenceCard();
  }, [challengeIndex, hideReferenceCard]);

  useEffect(() => {
    if (phase !== "game" || isComplete || !challenge?.audioNote) return;
    void pianoRef.current?.playKeyByNote(challenge.audioNote);
  }, [challenge, isComplete, phase]);

  const playAnswerFeedback = useCallback(
    async (
      answer: string,
      currentChallenge: ResolvedChallenge,
      fromPiano: boolean,
    ) => {
      const note = noteForAnswer(lesson, currentChallenge, answer);
      if (!lesson.noteToKeyId[note]) return;

      if (fromPiano) {
        pianoRef.current?.highlightKeyByNote(note, ADVANCE_MS);
      } else {
        await pianoRef.current?.playKeyByNote(note);
      }
    },
    [lesson],
  );

  const handleReviewLesson = useCallback(() => {
    resetGameState();
    setPhase("intro");
  }, [resetGameState]);

  const handleReplayGame = useCallback(() => {
    resetGameState();
    setPhase("game");
  }, [resetGameState]);

  const handleResetProgress = useCallback(() => {
    onResetProgress();
    resetGameState();
    setPhase("intro");
  }, [onResetProgress, resetGameState]);

  const advanceChallenge = useCallback(() => {
    if (challengeIndex >= total - 1) {
      setIsComplete(true);
      onComplete();
      return;
    }
    setChallengeIndex((i) => i + 1);
    setFeedback(null);
    setFeedbackTone(null);
    setSelectedChoice(null);
    setIsLocked(false);
    pianoRef.current?.clearHighlight();
  }, [challengeIndex, onComplete, total]);

  const handleReplayLesson = useCallback(() => {
    handleReplayGame();
  }, [handleReplayGame]);

  const handleResetProgressFromComplete = useCallback(() => {
    handleResetProgress();
  }, [handleResetProgress]);

  const handleAnswer = useCallback(
    async (rawAnswer: string, fromPiano = false) => {
      if (isLocked || isComplete || !challenge) return;

      const answer = fromPiano
        ? answerFromPianoNote(lesson, challenge, rawAnswer)
        : rawAnswer;

      if (answer === challenge.answer) {
        setIsLocked(true);
        setScore((s) => s + 1);
        setFeedback(getCorrectFeedback(lesson, challenge));
        setFeedbackTone("correct");
        await playAnswerFeedback(challenge.answer, challenge, fromPiano);

        advanceTimeoutRef.current = setTimeout(() => {
          advanceChallenge();
        }, ADVANCE_MS);
      } else {
        setSelectedChoice(rawAnswer);
        setFeedback(getWrongFeedback(lesson, challenge));
        setFeedbackTone("wrong");
        setWrongAttemptCount((count) => {
          const next = count + 1;
          if (next >= 2) showReferenceCardTemporarily(true);
          return next;
        });
      }
    },
    [
      advanceChallenge,
      challenge,
      isComplete,
      isLocked,
      lesson,
      playAnswerFeedback,
      showReferenceCardTemporarily,
    ],
  );

  const handlePianoSelect = useCallback(
    (note: string) => {
      if (!challenge || !acceptsPianoNote(lesson, challenge, note)) return;
      void handleAnswer(note, true);
    },
    [challenge, handleAnswer, lesson],
  );

  const handleStartGame = useCallback(() => {
    resetGameState();
    setPhase("game");
  }, [resetGameState]);

  const progressPercent =
    phase === "intro" || phase === "menu"
      ? 0
      : isComplete
        ? 100
        : ((challengeIndex + (feedbackTone === "correct" ? 1 : 0)) / total) *
          100;

  const modalHeight =
    phase === "intro"
      ? "min(92dvh,780px)"
      : phase === "menu"
        ? "min(92dvh,420px)"
        : "min(92dvh,680px)";

  const modalWidthClass =
    phase === "intro" ? "max-w-lg sm:max-w-xl lg:max-w-2xl" : "max-w-md sm:max-w-lg";

  const phaseDebugLabel = `Phase: ${phase}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Close lesson"
        className="absolute inset-0 bg-text/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`relative flex w-full flex-col overflow-hidden rounded-3xl border border-border-soft bg-background shadow-[0_24px_80px_-16px_rgba(31,29,26,0.28)] ${modalWidthClass}`}
        style={{ height: modalHeight }}
      >
        <div className={`shrink-0 border-b border-border-soft sm:px-6 ${phase === "intro" || phase === "menu" ? "px-4 py-3" : "px-5 py-4"}`}>
          <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-clay">
            {phaseDebugLabel}
          </p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {phase === "intro" ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="truncate text-lg font-medium tracking-[-0.02em] text-text sm:text-xl">
                      {lesson.title}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIntroShowNumbers((value) => !value)}
                      className="group hidden shrink-0 items-center gap-2 rounded-full border border-border bg-section/80 px-3 py-1.5 transition-colors hover:border-walnut/30 hover:bg-section min-[420px]:flex"
                      aria-pressed={introShowNumbers}
                    >
                      <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted transition-colors group-hover:text-text">
                        Numbers {introShowNumbers ? "ON" : "OFF"}
                      </span>
                      <span
                        className={`relative h-4 w-7 rounded-full transition-colors ${
                          introShowNumbers ? "bg-walnut" : "bg-border"
                        }`}
                      >
                        <span
                          className={`absolute top-[3px] size-2.5 rounded-full bg-card shadow-sm transition-transform ${
                            introShowNumbers ? "left-[13px]" : "left-[3px]"
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 min-[420px]:hidden">
                    <p className="text-sm font-medium text-muted">
                      Learn before you play
                    </p>
                    <button
                      type="button"
                      onClick={() => setIntroShowNumbers((value) => !value)}
                      className="group flex shrink-0 items-center gap-2 rounded-full border border-border bg-section/80 px-2.5 py-1 transition-colors hover:border-walnut/30 hover:bg-section"
                      aria-pressed={introShowNumbers}
                    >
                      <span className="font-mono text-[9px] tracking-[0.08em] uppercase text-muted">
                        Numbers {introShowNumbers ? "ON" : "OFF"}
                      </span>
                    </button>
                  </div>
                  <p className="mt-0.5 hidden text-sm font-medium text-muted min-[420px]:block">
                    Learn before you play
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-olive">
                    {lesson.title}
                    {phase === "game" &&
                      hasCompletedBefore &&
                      !isComplete && (
                        <span className="ml-2 text-muted">· Review</span>
                      )}
                  </p>
                  {phase === "menu" ? (
                    <p className="mt-0.5 text-sm font-medium text-text">
                      Lesson completed
                    </p>
                  ) : !isComplete ? (
                    <p className="mt-0.5 text-sm font-medium text-text">
                      Challenge {challengeIndex + 1} of {total}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-sm font-medium text-text">
                      Lesson complete
                    </p>
                  )}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-soft bg-card text-muted transition-colors hover:text-text"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {phase === "game" && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-section">
              <motion.div
                className="h-full rounded-full bg-walnut"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          )}
        </div>

        {phase === "menu" ? (
          <div className="flex min-h-0 flex-1 flex-col justify-center px-5 py-6 sm:px-6">
            <div className="text-center">
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-olive">
                Welcome back
              </p>
              <p className="mt-3 text-lg leading-relaxed text-muted">
                You have already completed {lesson.title}. Choose how you want to
                continue.
              </p>
              <div className="mt-6 flex w-full flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleReviewLesson}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-walnut/30 bg-card text-sm font-medium text-text transition-colors hover:border-walnut/50 hover:bg-section"
                >
                  Review Lesson
                </button>
                <button
                  type="button"
                  onClick={handleReplayGame}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-walnut text-sm font-medium text-card transition-colors hover:bg-clay"
                >
                  Replay Game
                </button>
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="inline-flex h-10 w-full items-center justify-center rounded-full border border-border-soft bg-section/60 text-sm text-muted transition-colors hover:border-clay/40 hover:text-text"
                >
                  Reset Progress
                </button>
              </div>
            </div>
          </div>
        ) : phase === "intro" ? (
          <LessonIntroScreen
            lesson={lesson}
            pianoRef={pianoRef}
            onStartGame={handleStartGame}
            keyNumbers={keyNumbers}
            showNumbers={introShowNumbers}
            lessonScalePlayback={lessonScalePlayback}
            lessonTriadsByDegree={lessonTriadsByDegree}
            introProgressions={introProgressions}
            lessonProgressions={lessonProgressions}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col justify-center px-5 py-4 sm:px-6">
            <AnimatePresence mode="wait">
              {isComplete ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-olive">
                  Well done
                </p>
                <p className="mt-3 text-2xl font-medium tracking-[-0.02em] text-text">
                  {lesson.title} complete.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {lesson.completionMessage}
                </p>
                <p className="mt-4 font-mono text-sm text-walnut">
                  Score: {score} / {total}
                </p>
                <div className="mt-6 flex w-full flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleReplayLesson}
                    className="inline-flex h-11 w-full items-center justify-center rounded-full bg-walnut text-sm font-medium text-card transition-colors hover:bg-clay"
                  >
                    Replay Game
                  </button>
                  <button
                    type="button"
                    onClick={handleReviewLesson}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-walnut/30 bg-card text-sm font-medium text-text transition-colors hover:border-walnut/50 hover:bg-section"
                  >
                    Review Lesson
                  </button>
                  <button
                    type="button"
                    onClick={handleResetProgressFromComplete}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-border-soft bg-card text-sm text-muted transition-colors hover:border-clay/40 hover:text-text"
                  >
                    Reset Progress
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-border-soft bg-section/60 text-sm font-medium text-text transition-colors hover:bg-section"
                  >
                    Continue Learning
                  </button>
                </div>
                {lesson.nextLessonLabel && (
                  <p className="mt-4 font-mono text-[10px] tracking-[0.08em] text-muted">
                    {lesson.nextLessonLabel}
                  </p>
                )}
              </motion.div>
            ) : (
              challenge && (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center"
                >
                  <p className="max-w-xs text-xl font-medium leading-snug tracking-[-0.02em] text-text sm:text-2xl">
                    {challenge.prompt}
                  </p>

                  <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-2.5">
                    {challenge.choices.map((choice) => {
                      const isSelected = selectedChoice === choice;
                      const isCorrectChoice = choice === challenge.answer;
                      let state: "default" | "correct" | "wrong" = "default";
                      if (feedbackTone === "correct" && isCorrectChoice) {
                        state = "correct";
                      } else if (feedbackTone === "wrong" && isSelected) {
                        state = "wrong";
                      }

                      return (
                        <button
                          key={choice}
                          type="button"
                          disabled={isLocked}
                          onClick={() => void handleAnswer(choice)}
                          className={`rounded-xl border px-4 py-3.5 text-lg font-medium transition-colors ${
                            state === "correct"
                              ? "border-walnut bg-walnut text-card"
                              : state === "wrong"
                                ? "border-clay/50 bg-clay/10 text-text"
                                : "border-border-soft bg-card text-text hover:border-walnut/35 active:scale-[0.98]"
                          } disabled:cursor-default`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>

                  <p
                    className={`mt-5 min-h-[1.25rem] text-sm ${
                      feedbackTone === "correct"
                        ? "font-mono tracking-wide text-olive"
                        : feedbackTone === "wrong"
                          ? "text-muted"
                          : "text-transparent"
                    }`}
                  >
                    {feedback ?? "·"}
                  </p>

                  <p className="mt-1 font-mono text-[10px] tracking-[0.08em] text-muted">
                    {challenge.pianoAnswerMode === "none"
                      ? "Tap a button to answer"
                      : "Tap a button or play the piano"}
                  </p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
        )}

        {phase === "game" && (
        <div className="shrink-0 border-t border-border-soft bg-section/30 px-3 py-3 sm:px-4">
          {!isComplete && (
            <div className="mb-2 space-y-2">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => showReferenceCardTemporarily(false)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-card px-3 py-1.5 font-mono text-[10px] tracking-[0.06em] text-muted transition-colors hover:border-walnut/30 hover:text-text"
                >
                  <span aria-hidden>💡</span>
                  Hint
                </button>
              </div>
              <AnimatePresence>
                {showReferenceCard && (
                  <motion.div
                    key="hint-card"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <NumberReferenceCard
                      title={lesson.title}
                      reference={hintReference}
                      auto={hintAutoShown}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <PianoKeyboard
            ref={pianoRef}
            compact
            defaultShowNumbers
            showScaleButton={false}
            showHint={false}
            keyLabel={lesson.keyId}
            noteToKeyId={lesson.noteToKeyId}
            keyNumbers={keyNumbers}
            lessonScaleKeyIds={lessonScaleKeyIds}
            lessonChordsByNumber={lessonChordsByNumber}
            onNoteSelect={!isComplete ? handlePianoSelect : undefined}
          />
        </div>
        )}
      </motion.div>
    </div>
  );
}
