"use client";

import { useCallback, useMemo, useState } from "react";
import {
  PianoKeyboard,
  type PianoKeyboardHandle,
} from "@/components/landing/PianoKeyboard";
import { getHintReference, getIntroSummary, INTRO_PROGRESSION_IDS } from "@/lib/lessons/engine";
import {
  formatProgressionPreview,
  getTriadShortLabel,
} from "@/lib/learn/intro-labels";
import type {
  CommonProgression,
  IntroProgressionId,
  LessonDefinition,
  ScaleNumber,
  ScalePlaybackNote,
  TriadPlayback,
} from "@/lib/lessons/types";
import type { RefObject } from "react";

const SCALE_DEGREES: ScaleNumber[] = ["1", "2", "3", "4", "5", "6", "7"];

type ActivePlayback =
  | {
      kind: "scale";
      numbersLabel: string;
      chordsLabel: string;
    }
  | {
      kind: "degree";
      numbersLabel: string;
      chordsLabel: string;
    }
  | {
      kind: "progression";
      numbersLabel: string;
      chordLabels: string[];
      activeStep: number;
    };

type LessonIntroScreenProps = {
  lesson: LessonDefinition;
  pianoRef: RefObject<PianoKeyboardHandle | null>;
  onStartGame: () => void;
  keyNumbers: Record<string, string>;
  showNumbers: boolean;
  lessonScalePlayback: ScalePlaybackNote[];
  lessonTriadsByDegree: Record<ScaleNumber, TriadPlayback>;
  introProgressions: Record<IntroProgressionId, CommonProgression>;
  lessonProgressions: Record<IntroProgressionId, TriadPlayback[]>;
};

function DegreeButton({
  degree,
  chordLabel,
  onClick,
}: {
  degree: ScaleNumber | "Scale";
  chordLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl border border-walnut/20 bg-card px-2 py-2 transition-colors hover:border-walnut/40 hover:bg-section/80"
    >
      <span className="font-mono text-sm font-semibold tracking-wide text-walnut">
        {degree}
      </span>
      <span className="mt-0.5 font-mono text-[10px] tracking-wide text-muted">
        {chordLabel}
      </span>
    </button>
  );
}

function ProgressionButton({
  id,
  preview,
  onClick,
}: {
  id: IntroProgressionId;
  preview: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[3.25rem] flex-col items-start justify-center rounded-xl border border-border-soft bg-card px-3 py-2 text-left transition-colors hover:border-walnut/35 hover:bg-section/70"
    >
      <span className="font-mono text-[11px] font-medium tracking-[0.04em] text-text">
        {id}
      </span>
      <span className="mt-0.5 truncate font-mono text-[10px] tracking-wide text-muted">
        {preview}
      </span>
    </button>
  );
}

export function LessonIntroScreen({
  lesson,
  pianoRef,
  onStartGame,
  keyNumbers,
  showNumbers,
  lessonScalePlayback,
  lessonTriadsByDegree,
  introProgressions,
  lessonProgressions,
}: LessonIntroScreenProps) {
  const summary = getIntroSummary(lesson);
  const reference = getHintReference(lesson);
  const [activePlayback, setActivePlayback] = useState<ActivePlayback | null>(
    null,
  );

  const degreeLabels = useMemo(
    () =>
      Object.fromEntries(
        SCALE_DEGREES.map((degree) => [degree, getTriadShortLabel(lesson, degree)]),
      ) as Record<ScaleNumber, string>,
    [lesson],
  );

  const clearPlayback = useCallback(() => {
    setActivePlayback(null);
  }, []);

  const handleProgressionStep = useCallback(
    (stepIndex: number) => {
      setActivePlayback((current) => {
        if (!current || current.kind !== "progression") return current;
        return { ...current, activeStep: stepIndex };
      });
    },
    [],
  );

  const handleScale = useCallback(() => {
    setActivePlayback({
      kind: "scale",
      numbersLabel: "Scale",
      chordsLabel: lesson.scale.join(" → "),
    });
    void pianoRef.current?.playScale();
  }, [lesson.scale, pianoRef]);

  const handleDegree = useCallback(
    (degree: ScaleNumber) => {
      setActivePlayback({
        kind: "degree",
        numbersLabel: degree,
        chordsLabel: degreeLabels[degree],
      });
      void pianoRef.current?.playChordByDegree(degree);
    },
    [degreeLabels, pianoRef],
  );

  const handleProgression = useCallback(
    (id: IntroProgressionId) => {
      const progression = introProgressions[id];
      const chordLabels = progression.steps.map((step) =>
        getTriadShortLabel(lesson, step.number),
      );
      setActivePlayback({
        kind: "progression",
        numbersLabel: progression.numbersLabel,
        chordLabels,
        activeStep: 0,
      });
      void pianoRef.current?.playProgressionById(id);
    },
    [introProgressions, lesson, pianoRef],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
      <div className="shrink-0 space-y-3 px-4 py-4 sm:px-6">
        <p className="max-w-prose text-sm leading-relaxed text-muted">{summary}</p>
        <div className="rounded-2xl border border-border-soft bg-section/35 px-4 py-3">
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-olive">
            Nashville Numbers
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
            {reference.map(({ number, note }) => (
              <span
                key={number}
                className="font-mono text-xs font-medium tracking-wide text-text"
              >
                {number}={note}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-3 sm:px-6">
        <PianoKeyboard
          ref={pianoRef}
          dense
          showNumbers={showNumbers}
          showNumbersToggle={false}
          showTopLabels={false}
          showScaleButton={false}
          showHint={false}
          showKeyHeader={false}
          keyLabel={lesson.keyId}
          noteToKeyId={lesson.noteToKeyId}
          keyNumbers={keyNumbers}
          lessonScalePlayback={lessonScalePlayback}
          lessonTriadsByDegree={lessonTriadsByDegree}
          lessonProgressions={lessonProgressions}
          onPlaybackEnd={clearPlayback}
          onProgressionStep={handleProgressionStep}
        />
      </div>

      <div className="shrink-0 space-y-4 border-t border-border-soft bg-section/20 px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border-soft bg-card/80 p-4">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-olive">
              Hear the Key
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2 min-[480px]:grid-cols-8">
              <DegreeButton
                degree="Scale"
                chordLabel={lesson.keyId}
                onClick={handleScale}
              />
              {SCALE_DEGREES.map((degree) => (
                <DegreeButton
                  key={degree}
                  degree={degree}
                  chordLabel={degreeLabels[degree]}
                  onClick={() => handleDegree(degree)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border-soft bg-card/80 p-4">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-olive">
              Hear Progressions
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
              {INTRO_PROGRESSION_IDS.map((id) => (
                <ProgressionButton
                  key={id}
                  id={id}
                  preview={formatProgressionPreview(introProgressions[id].steps)}
                  onClick={() => handleProgression(id)}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="min-h-[3rem] rounded-xl border border-walnut/15 bg-card/70 px-3 py-2.5">
          {activePlayback ? (
            <>
              <p className="font-mono text-[10px] tracking-[0.08em] text-muted">
                Now playing:{" "}
                <span className="text-walnut">{activePlayback.numbersLabel}</span>
              </p>
              {activePlayback.kind === "progression" ? (
                <p className="mt-1 font-mono text-[10px] leading-relaxed tracking-[0.04em]">
                  {activePlayback.chordLabels.map((chord, index) => (
                    <span key={`${chord}-${index}`}>
                      <span
                        className={
                          index === activePlayback.activeStep
                            ? "font-medium text-walnut"
                            : "text-muted"
                        }
                      >
                        {chord}
                      </span>
                      {index < activePlayback.chordLabels.length - 1 ? (
                        <span className="text-muted/60"> → </span>
                      ) : null}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="mt-1 font-mono text-[10px] tracking-[0.04em] text-text">
                  {activePlayback.chordsLabel}
                </p>
              )}
            </>
          ) : (
            <p className="font-mono text-[10px] tracking-[0.08em] text-muted/70">
              Tap a control to hear the key or a progression.
            </p>
          )}
        </div>

        <div className="flex justify-end pb-1">
          <button
            type="button"
            onClick={onStartGame}
            className="inline-flex h-10 min-w-[9.5rem] items-center justify-center rounded-full bg-walnut px-5 text-sm font-medium text-card shadow-[0_4px_16px_-4px_rgba(138,103,70,0.45)] transition-colors hover:bg-clay"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
