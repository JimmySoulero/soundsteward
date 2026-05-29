"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";
import { C_MAJOR_CHORDS } from "@/lib/piano/c-major-chords";
import type {
  IntroProgressionId,
  ScaleNumber,
  ScalePlaybackNote,
  TriadPlayback,
} from "@/lib/lessons/types";

const ease = [0.22, 1, 0.36, 1] as const;

const SCALE_NOTE_DURATION = 0.32;
const SCALE_STEP = 0.38;
const CHORD_DURATION = 0.92;
const PROGRESSION_STEP = 1.22;
const WHITE_KEY_COUNT = 8;
const SALAMANDER_BASE = "https://tonejs.github.io/audio/salamander/";

type PianoKey = {
  id: string;
  note: string;
  pitch: string;
  nashville: string;
  type: "white" | "black";
  afterWhiteIndex?: number;
};

const PIANO_KEYS: PianoKey[] = [
  { id: "c", note: "C", pitch: "C4", nashville: "1", type: "white" },
  { id: "cs", note: "C#", pitch: "C#4", nashville: "b2", type: "black", afterWhiteIndex: 0 },
  { id: "d", note: "D", pitch: "D4", nashville: "2", type: "white" },
  { id: "ds", note: "D#", pitch: "D#4", nashville: "b3", type: "black", afterWhiteIndex: 1 },
  { id: "e", note: "E", pitch: "E4", nashville: "3", type: "white" },
  { id: "f", note: "F", pitch: "F4", nashville: "4", type: "white" },
  { id: "fs", note: "F#", pitch: "F#4", nashville: "b5", type: "black", afterWhiteIndex: 3 },
  { id: "g", note: "G", pitch: "G4", nashville: "5", type: "white" },
  { id: "gs", note: "G#", pitch: "G#4", nashville: "b6", type: "black", afterWhiteIndex: 4 },
  { id: "a", note: "A", pitch: "A4", nashville: "6", type: "white" },
  { id: "as", note: "A#", pitch: "A#4", nashville: "b7", type: "black", afterWhiteIndex: 5 },
  { id: "b", note: "B", pitch: "B4", nashville: "7", type: "white" },
  { id: "c2", note: "C", pitch: "C5", nashville: "1", type: "white" },
];

const NOTE_TO_KEY_ID: Record<string, string> = {
  C: "c",
  D: "d",
  E: "e",
  F: "f",
  G: "g",
  A: "a",
  B: "b",
  "F#": "fs",
};

const C_MAJOR_SCALE = ["c", "d", "e", "f", "g", "a", "b", "c2"] as const;

const WHITE_KEYS = PIANO_KEYS.filter((key) => key.type === "white");
const BLACK_KEYS = PIANO_KEYS.filter((key) => key.type === "black");
const KEY_BY_ID = Object.fromEntries(PIANO_KEYS.map((key) => [key.id, key]));

function blackKeyLeftPercent(afterWhiteIndex: number): number {
  return ((afterWhiteIndex + 1) / WHITE_KEY_COUNT) * 100;
}

function whiteKeyLeftPercent(whiteIndex: number): number {
  return (whiteIndex / WHITE_KEY_COUNT) * 100;
}

type PianoVoice = {
  triggerAttackRelease: (
    note: string | string[],
    duration: number | string,
    time?: number,
  ) => void;
};

export type PianoKeyboardHandle = {
  playScale: () => Promise<void>;
  playKeyByNote: (note: string) => Promise<void>;
  highlightKeyByNote: (note: string, durationMs?: number) => void;
  playKeyIds: (keyIds: string[], duration?: number) => Promise<void>;
  playChordByNumber: (number: "1" | "4" | "5") => Promise<void>;
  playChordByDegree: (degree: ScaleNumber) => Promise<void>;
  play145Progression: () => Promise<void>;
  playProgressionById: (id: IntroProgressionId) => Promise<void>;
  clearHighlight: () => void;
};

type PianoKeyboardProps = {
  playScaleLabel?: string;
  defaultShowNumbers?: boolean;
  showScaleButton?: boolean;
  showHint?: boolean;
  onNoteSelect?: (note: string, keyId: string) => void;
  onScalePlayed?: () => void;
  compact?: boolean;
  keyLabel?: string;
  noteToKeyId?: Record<string, string>;
  /** key id → Nashville number label for lesson mode */
  keyNumbers?: Record<string, string>;
  /** When set, Play Scale / chord buttons use this lesson's audio */
  lessonScaleKeyIds?: string[];
  lessonScalePlayback?: ScalePlaybackNote[];
  lessonChordsByNumber?: Record<"1" | "4" | "5", string[]>;
  lessonTriadsByDegree?: Record<ScaleNumber, TriadPlayback>;
  lessonProgressions?: Record<IntroProgressionId, TriadPlayback[]>;
  onPlaybackEnd?: () => void;
  onProgressionStep?: (stepIndex: number, totalSteps: number) => void;
  /** Controlled numbers/notes display */
  showNumbers?: boolean;
  onShowNumbersChange?: (value: boolean) => void;
  /** Show the numbers toggle inside the piano card */
  showNumbersToggle?: boolean;
  /** Labels above the keys (top row) */
  showTopLabels?: boolean;
  /** Tighter layout for lesson intro panel */
  dense?: boolean;
  showKeyHeader?: boolean;
};

export const PianoKeyboard = forwardRef<PianoKeyboardHandle, PianoKeyboardProps>(
  function PianoKeyboard(
    {
      playScaleLabel = "Play C Major",
      defaultShowNumbers = false,
      showScaleButton = true,
      showHint = true,
      onNoteSelect,
      onScalePlayed,
      compact = false,
      keyLabel = "C",
      noteToKeyId: noteToKeyIdProp,
      keyNumbers,
      lessonScaleKeyIds,
      lessonScalePlayback,
      lessonChordsByNumber,
      lessonTriadsByDegree,
      lessonProgressions,
      onPlaybackEnd,
      onProgressionStep,
      showNumbers: showNumbersProp,
      onShowNumbersChange,
      showNumbersToggle = true,
      showTopLabels = true,
      dense = false,
      showKeyHeader = true,
    },
    ref,
  ) {
    const [internalShowNumbers, setInternalShowNumbers] = useState(defaultShowNumbers);
    const isNumbersControlled = showNumbersProp !== undefined;
    const showNumbers = isNumbersControlled ? showNumbersProp : internalShowNumbers;

    const toggleShowNumbers = useCallback(() => {
      const next = !showNumbers;
      if (!isNumbersControlled) {
        setInternalShowNumbers(next);
      }
      onShowNumbersChange?.(next);
    }, [isNumbersControlled, onShowNumbersChange, showNumbers]);
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [highlightedKeys, setHighlightedKeys] = useState<string[]>([]);
    const [isPlayingScale, setIsPlayingScale] = useState(false);
    const [isPlayingSequence, setIsPlayingSequence] = useState(false);

    const voiceRef = useRef<PianoVoice | null>(null);
    const samplerRef = useRef<Tone.Sampler | null>(null);
    const fallbackRef = useRef<Tone.PolySynth | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const scaleTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearScheduled = useCallback(() => {
      scaleTimeoutsRef.current.forEach(clearTimeout);
      scaleTimeoutsRef.current = [];
    }, []);

    useEffect(() => {
      let disposed = false;

      const reverb = new Tone.Reverb({ decay: 2.1, wet: 0.17 });
      reverbRef.current = reverb;

      const fallback = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: {
          attack: 0.06,
          decay: 0.26,
          sustain: 0.28,
          release: 1.25,
        },
      });
      fallback.volume.value = -14;
      fallbackRef.current = fallback;

      const setup = async () => {
        await reverb.generate();
        if (disposed) return;

        reverb.toDestination();
        fallback.connect(reverb);
        voiceRef.current = fallback;

        try {
          const sampler = new Tone.Sampler({
            urls: {
              C4: "C4.mp3",
              "D#4": "Ds4.mp3",
              "F#4": "Fs4.mp3",
              A4: "A4.mp3",
              C5: "C5.mp3",
            },
            baseUrl: SALAMANDER_BASE,
            release: 1.15,
            attack: 0.005,
          });
          sampler.volume.value = -4;
          sampler.connect(reverb);
          await sampler.loaded;

          if (disposed) {
            sampler.dispose();
            return;
          }

          samplerRef.current = sampler;
          voiceRef.current = sampler;
        } catch {
          // Soft PolySynth fallback.
        }
      };

      void setup();

      return () => {
        disposed = true;
        clearScheduled();
        samplerRef.current?.dispose();
        fallbackRef.current?.dispose();
        reverbRef.current?.dispose();
        voiceRef.current = null;
      };
    }, [clearScheduled]);

    const ensureAudioStarted = useCallback(async () => {
      if (Tone.getContext().state !== "running") {
        await Tone.start();
      }
    }, []);

    const triggerNote = useCallback(
      (pitch: string | string[], duration: number | string, time?: number) => {
        voiceRef.current?.triggerAttackRelease(pitch, duration, time);
      },
      [],
    );

    const isKeyHighlighted = useCallback(
      (keyId: string) =>
        activeKey === keyId || highlightedKeys.includes(keyId),
      [activeKey, highlightedKeys],
    );

    const flashKeys = useCallback(
      (keyIds: string[], durationMs: number) => {
        setHighlightedKeys(keyIds);
        const timeout = setTimeout(() => {
          setHighlightedKeys([]);
        }, durationMs);
        scaleTimeoutsRef.current.push(timeout);
      },
      [],
    );

    const playKeyId = useCallback(
      async (keyId: string, duration = 0.62) => {
        const key = KEY_BY_ID[keyId];
        if (!key) return;

        await ensureAudioStarted();
        triggerNote(key.pitch, duration);
        setActiveKey(keyId);
      },
      [ensureAudioStarted, triggerNote],
    );

    const playVoicedChord = useCallback(
      async (
        playback: TriadPlayback,
        duration = CHORD_DURATION,
      ) => {
        if (playback.pitches.length === 0) return;

        await ensureAudioStarted();
        setIsPlayingSequence(true);
        triggerNote(playback.pitches, duration);
        flashKeys(playback.keyIds, duration * 1000);

        const timeout = setTimeout(() => {
          setActiveKey(null);
          setIsPlayingSequence(false);
          onPlaybackEnd?.();
        }, duration * 1000);
        scaleTimeoutsRef.current.push(timeout);
      },
      [ensureAudioStarted, flashKeys, onPlaybackEnd, triggerNote],
    );

    const playKeyIds = useCallback(
      async (keyIds: string[], duration = CHORD_DURATION) => {
        const pitches = keyIds
          .map((id) => KEY_BY_ID[id]?.pitch)
          .filter(Boolean) as string[];
        if (pitches.length === 0) return;

        await playVoicedChord({ pitches, keyIds }, duration);
      },
      [playVoicedChord],
    );

    const playScaleFromPlayback = useCallback(
      async (entries: ScalePlaybackNote[]) => {
        if (isPlayingScale || isPlayingSequence || entries.length === 0) return;

        await ensureAudioStarted();
        clearScheduled();
        setIsPlayingScale(true);
        setActiveKey(null);
        setHighlightedKeys([]);
        onScalePlayed?.();

        const startTime = Tone.now();

        entries.forEach(({ pitch, keyId }, index) => {
          triggerNote(pitch, SCALE_NOTE_DURATION, startTime + index * SCALE_STEP);

          const highlightAt = index * SCALE_STEP * 1000;
          const highlightTimeout = setTimeout(() => {
            setActiveKey(keyId);
            setHighlightedKeys([keyId]);
          }, highlightAt);
          scaleTimeoutsRef.current.push(highlightTimeout);

          const clearAt = highlightAt + SCALE_NOTE_DURATION * 1000;
          const clearTimeoutId = setTimeout(() => {
            setActiveKey((current) => (current === keyId ? null : current));
            setHighlightedKeys([]);
          }, clearAt);
          scaleTimeoutsRef.current.push(clearTimeoutId);
        });

        const finishAt = entries.length * SCALE_STEP * 1000;
        const finishTimeout = setTimeout(() => {
          setIsPlayingScale(false);
          setActiveKey(null);
          setHighlightedKeys([]);
          onPlaybackEnd?.();
        }, finishAt);
        scaleTimeoutsRef.current.push(finishTimeout);
      },
      [
        clearScheduled,
        ensureAudioStarted,
        isPlayingScale,
        isPlayingSequence,
        onPlaybackEnd,
        onScalePlayed,
        triggerNote,
      ],
    );

    const playScaleFromKeyIds = useCallback(
      async (keyIds: string[]) => {
        if (isPlayingScale || isPlayingSequence || keyIds.length === 0) return;

        await ensureAudioStarted();
        clearScheduled();
        setIsPlayingScale(true);
        setActiveKey(null);
        setHighlightedKeys([]);
        onScalePlayed?.();

        const startTime = Tone.now();

        keyIds.forEach((keyId, index) => {
          const key = KEY_BY_ID[keyId];
          if (!key) return;

          triggerNote(key.pitch, SCALE_NOTE_DURATION, startTime + index * SCALE_STEP);

          const highlightAt = index * SCALE_STEP * 1000;
          const highlightTimeout = setTimeout(() => {
            setActiveKey(keyId);
            setHighlightedKeys([keyId]);
          }, highlightAt);
          scaleTimeoutsRef.current.push(highlightTimeout);

          const clearAt = highlightAt + SCALE_NOTE_DURATION * 1000;
          const clearTimeoutId = setTimeout(() => {
            setActiveKey((current) => (current === keyId ? null : current));
            setHighlightedKeys([]);
          }, clearAt);
          scaleTimeoutsRef.current.push(clearTimeoutId);
        });

        const finishAt = keyIds.length * SCALE_STEP * 1000;
        const finishTimeout = setTimeout(() => {
          setIsPlayingScale(false);
          setActiveKey(null);
          setHighlightedKeys([]);
          onPlaybackEnd?.();
        }, finishAt);
        scaleTimeoutsRef.current.push(finishTimeout);
      },
      [
        clearScheduled,
        ensureAudioStarted,
        isPlayingScale,
        isPlayingSequence,
        onPlaybackEnd,
        onScalePlayed,
        triggerNote,
      ],
    );

    const playCMajor = useCallback(async () => {
      await playScaleFromKeyIds([...C_MAJOR_SCALE]);
    }, [playScaleFromKeyIds]);

    const resolveChordKeyIds = useCallback(
      (number: "1" | "4" | "5") =>
        lessonChordsByNumber?.[number] ?? [...C_MAJOR_CHORDS[number].keyIds],
      [lessonChordsByNumber],
    );

    const playChordByNumber = useCallback(
      async (number: "1" | "4" | "5") => {
        const triad = lessonTriadsByDegree?.[number];
        if (triad) {
          await playVoicedChord(triad);
          return;
        }
        await playKeyIds(resolveChordKeyIds(number));
      },
      [lessonTriadsByDegree, playKeyIds, playVoicedChord, resolveChordKeyIds],
    );

    const playChordByDegree = useCallback(
      async (degree: ScaleNumber) => {
        const triad = lessonTriadsByDegree?.[degree];
        if (!triad) return;
        await playVoicedChord(triad);
      },
      [lessonTriadsByDegree, playVoicedChord],
    );

    const playProgression = useCallback(
      async (chords: TriadPlayback[]) => {
        if (isPlayingSequence || isPlayingScale || chords.length === 0) return;

        await ensureAudioStarted();
        clearScheduled();
        setIsPlayingSequence(true);

        const startTime = Tone.now();

        chords.forEach((chord, index) => {
          const at = startTime + index * PROGRESSION_STEP;
          triggerNote(chord.pitches, CHORD_DURATION, at);

          const highlightAt = index * PROGRESSION_STEP * 1000;
          const highlightTimeout = setTimeout(() => {
            setHighlightedKeys([...chord.keyIds]);
            onProgressionStep?.(index, chords.length);
          }, highlightAt);
          scaleTimeoutsRef.current.push(highlightTimeout);

          const clearAt = highlightAt + CHORD_DURATION * 1000;
          const clearTimeoutId = setTimeout(() => {
            setHighlightedKeys([]);
          }, clearAt);
          scaleTimeoutsRef.current.push(clearTimeoutId);
        });

        const finishAt = chords.length * PROGRESSION_STEP * 1000;
        const finishTimeout = setTimeout(() => {
          setIsPlayingSequence(false);
          setHighlightedKeys([]);
          onPlaybackEnd?.();
        }, finishAt);
        scaleTimeoutsRef.current.push(finishTimeout);
      },
      [
        clearScheduled,
        ensureAudioStarted,
        isPlayingScale,
        isPlayingSequence,
        onPlaybackEnd,
        onProgressionStep,
        triggerNote,
      ],
    );

    const play145Progression = useCallback(async () => {
      const preset = lessonProgressions?.["1-4-5"];
      if (preset) {
        await playProgression(preset);
        return;
      }
      const chords = (["1", "4", "5"] as const).map((num) => ({
        pitches: resolveChordKeyIds(num)
          .map((id) => KEY_BY_ID[id]?.pitch)
          .filter(Boolean) as string[],
        keyIds: resolveChordKeyIds(num),
      }));
      await playProgression(chords);
    }, [lessonProgressions, playProgression, resolveChordKeyIds]);

    const playProgressionById = useCallback(
      async (id: IntroProgressionId) => {
        const preset = lessonProgressions?.[id];
        if (!preset) return;
        await playProgression(preset);
      },
      [lessonProgressions, playProgression],
    );

    const playLessonScale = useCallback(async () => {
      if (lessonScalePlayback?.length) {
        await playScaleFromPlayback(lessonScalePlayback);
        return;
      }
      if (lessonScaleKeyIds?.length) {
        await playScaleFromKeyIds(lessonScaleKeyIds);
        return;
      }
      await playCMajor();
    }, [
      lessonScaleKeyIds,
      lessonScalePlayback,
      playCMajor,
      playScaleFromKeyIds,
      playScaleFromPlayback,
    ]);

    const noteToKeyId = noteToKeyIdProp ?? NOTE_TO_KEY_ID;

    const getDisplayLabel = useCallback(
      (key: PianoKey) => {
        if (showNumbers && keyNumbers?.[key.id]) return keyNumbers[key.id];
        if (showNumbers && keyNumbers) return key.note;
        return showNumbers ? key.nashville : key.note;
      },
      [keyNumbers, showNumbers],
    );

    const highlightKeyByNote = useCallback(
      (note: string, durationMs = 1000) => {
        const keyId = noteToKeyId[note];
        if (!keyId) return;
        setActiveKey(keyId);
        flashKeys([keyId], durationMs);
      },
      [flashKeys, noteToKeyId],
    );

    useImperativeHandle(
      ref,
      () => ({
        playScale: playLessonScale,
        playKeyByNote: async (note: string) => {
          const keyId = noteToKeyId[note];
          if (keyId) {
            await playKeyId(keyId);
            flashKeys([keyId], 1000);
          }
        },
        highlightKeyByNote,
        playKeyIds,
        playChordByNumber,
        playChordByDegree,
        play145Progression,
        playProgressionById,
        clearHighlight: () => {
          setActiveKey(null);
          setHighlightedKeys([]);
        },
      }),
      [
        playCMajor,
        playLessonScale,
        playScaleFromKeyIds,
        playChordByNumber,
        playChordByDegree,
        play145Progression,
        playProgressionById,
        playKeyId,
        playKeyIds,
        highlightKeyByNote,
        noteToKeyId,
      ],
    );

    const handleKeyPointerDown = useCallback(
      (keyId: string, note: string) => {
        if (isPlayingScale || isPlayingSequence) return;
        void playKeyId(keyId);
        onNoteSelect?.(note, keyId);
      },
      [isPlayingScale, isPlayingSequence, onNoteSelect, playKeyId],
    );

    const handleKeyPointerUp = useCallback(() => {
      if (!isPlayingScale && !isPlayingSequence) {
        setActiveKey(null);
      }
    }, [isPlayingScale, isPlayingSequence]);

    const inputLocked = isPlayingScale || isPlayingSequence;
    const shellPadding = dense
      ? "rounded-xl p-2"
      : compact
        ? "rounded-2xl p-2.5 sm:p-3"
        : "p-4 sm:p-5 lg:rounded-[2rem] lg:p-6";
    const whiteKeyHeight = dense
      ? "h-[clamp(3.25rem,11vw,5rem)]"
      : compact
        ? "h-[88px] sm:h-[96px]"
        : "h-[140px] sm:h-[152px] lg:h-[168px]";
    const blackKeyHeight = dense
      ? "h-[clamp(2rem,6.5vw,3rem)]"
      : compact
        ? "h-[54px] sm:h-[58px]"
        : "h-[86px] sm:h-[94px] lg:h-[104px]";
    const keyLabelClass = dense
      ? "text-[8px] tracking-tight min-[420px]:text-[9px] sm:text-[10px]"
      : "text-[11px] sm:text-xs";
    const topLabelClass = dense
      ? "text-[8px] tracking-tight min-[420px]:text-[9px] sm:text-[10px]"
      : "text-[11px] sm:text-xs";
    const showHeaderBar =
      showKeyHeader || (showNumbersToggle && (compact || dense));

    return (
      <div className="mx-auto w-full max-w-full select-none">
        <div
          className={`rounded-[1.75rem] border border-border-soft bg-card shadow-[0_2px_4px_rgba(31,29,26,0.04),0_20px_50px_-12px_rgba(31,29,26,0.18),inset_0_1px_0_rgba(247,241,231,0.9)] ${shellPadding}`}
        >
          {showHeaderBar && (
            <div
              className={`flex items-center justify-between gap-2 border-b border-border-soft/80 ${
                dense ? "mb-2 pb-2" : compact ? "mb-2.5 pb-2" : "mb-5 gap-4 pb-4"
              }`}
            >
              {showKeyHeader ? (
                <div>
                  {!compact && !dense && (
                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-olive">
                      SoundSteward
                    </p>
                  )}
                  <p
                    className={`font-medium tracking-tight text-text ${
                      dense || compact ? "text-xs" : "mt-1 text-sm"
                    }`}
                  >
                    Key of {keyLabel}
                  </p>
                  {!compact && !dense && (
                    <p className="mt-0.5 font-mono text-[9px] tracking-[0.12em] uppercase text-muted">
                      Sound: Soft Piano
                    </p>
                  )}
                </div>
              ) : (
                <span className="sr-only">Piano keyboard</span>
              )}
              {showNumbersToggle && (
                <button
                  type="button"
                  onClick={toggleShowNumbers}
                  className={`group ml-auto flex items-center rounded-full border border-border bg-section/80 transition-colors hover:border-walnut/30 hover:bg-section ${
                    dense ? "gap-2 px-2.5 py-1" : "gap-2.5 px-3.5 py-2"
                  }`}
                  aria-pressed={showNumbers}
                >
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted transition-colors group-hover:text-text">
                    {showNumbers ? "Numbers" : "Notes"}
                  </span>
                  <span
                    className={`relative rounded-full transition-colors ${
                      dense ? "h-4 w-7" : "h-[18px] w-[34px]"
                    } ${showNumbers ? "bg-walnut" : "bg-border"}`}
                  >
                    <span
                      className={`absolute top-[3px] size-3 rounded-full bg-card shadow-sm transition-transform ${
                        showNumbers
                          ? dense
                            ? "left-[13px]"
                            : "left-[17px]"
                          : "left-[3px]"
                      }`}
                    />
                  </span>
                </button>
              )}
            </div>
          )}

          <div
            className={`relative rounded-2xl bg-section/70 shadow-[inset_0_2px_8px_rgba(31,29,26,0.06)] ${
              dense ? "p-1.5" : compact ? "p-2" : "p-3 sm:p-4"
            }`}
          >
            {showTopLabels && (
              <div
                className={`relative ${dense ? "mb-0.5 h-2.5 min-[420px]:h-3" : compact ? "mb-1 h-4" : "mb-2 h-5"}`}
              >
                {showNumbers &&
                  WHITE_KEYS.map((key, whiteIndex) => (
                    <div
                      key={`num-${key.id}`}
                      className="absolute bottom-0 flex justify-center overflow-hidden px-0.5"
                      style={{
                        left: `${whiteKeyLeftPercent(whiteIndex)}%`,
                        width: `${(1 / WHITE_KEY_COUNT) * 100}%`,
                      }}
                    >
                      <span
                        className={`truncate font-mono font-medium text-walnut ${topLabelClass}`}
                      >
                        {getDisplayLabel(key)}
                      </span>
                    </div>
                  ))}
                {showNumbers &&
                  BLACK_KEYS.map((key) => (
                    <div
                      key={`num-${key.id}`}
                      className="absolute bottom-0 max-w-[2rem] -translate-x-1/2 overflow-hidden"
                      style={{
                        left: `${blackKeyLeftPercent(key.afterWhiteIndex!)}%`,
                      }}
                    >
                      <span
                        className={`block truncate font-mono font-medium text-clay ${topLabelClass}`}
                      >
                        {getDisplayLabel(key)}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            <div className="relative flex rounded-xl bg-border/30 p-[3px] shadow-[0_8px_24px_-8px_rgba(31,29,26,0.2)]">
              {WHITE_KEYS.map((key, index) => {
                const isActive = isKeyHighlighted(key.id);

                return (
                  <motion.button
                    key={key.id}
                    type="button"
                    onPointerDown={() => handleKeyPointerDown(key.id, key.note)}
                    onPointerUp={handleKeyPointerUp}
                    onPointerLeave={handleKeyPointerUp}
                    onMouseEnter={() => {
                      if (!inputLocked) setActiveKey(key.id);
                    }}
                    onMouseLeave={() => {
                      if (!inputLocked) setActiveKey(null);
                    }}
                    whileTap={{ scaleY: 0.985, y: 3 }}
                    animate={{ y: isActive ? 3 : 0 }}
                    transition={{ duration: 0.12, ease }}
                    style={{
                      boxShadow: isActive
                        ? "inset 0 3px 10px rgba(31,29,26,0.12), 0 1px 0 rgba(247,241,231,0.8)"
                        : "inset 0 -2px 0 rgba(31,29,26,0.06), 0 4px 12px rgba(31,29,26,0.08)",
                    }}
                    className={`relative z-0 min-w-0 flex-1 touch-manipulation ${whiteKeyHeight} ${
                      index === 0
                        ? "rounded-l-[10px]"
                        : index === WHITE_KEYS.length - 1
                          ? "rounded-r-[10px]"
                          : ""
                    } border-r border-[#cfc3b0]/70 bg-gradient-to-b from-[#f7f1e7] via-[#f0e9dc] to-[#e8dfd0] last:border-r-0`}
                    aria-label={`${key.note}${showNumbers && keyNumbers?.[key.id] ? `, Nashville ${keyNumbers[key.id]}` : showNumbers ? `, Nashville ${key.nashville}` : ""}`}
                  >
                    <span
                      className={`absolute bottom-2 left-1/2 max-w-full -translate-x-1/2 truncate px-0.5 font-mono font-medium text-muted min-[420px]:bottom-2.5 ${keyLabelClass}`}
                    >
                      {getDisplayLabel(key)}
                    </span>
                  </motion.button>
                );
              })}

              {BLACK_KEYS.map((key) => {
                const isActive = isKeyHighlighted(key.id);

                return (
                  <motion.button
                    key={key.id}
                    type="button"
                    onPointerDown={() => handleKeyPointerDown(key.id, key.note)}
                    onPointerUp={handleKeyPointerUp}
                    onPointerLeave={handleKeyPointerUp}
                    onMouseEnter={() => {
                      if (!inputLocked) setActiveKey(key.id);
                    }}
                    onMouseLeave={() => {
                      if (!inputLocked) setActiveKey(null);
                    }}
                    whileTap={{ scaleY: 0.98, y: 2 }}
                    animate={{ y: isActive ? 2 : 0 }}
                    transition={{ duration: 0.12, ease }}
                    style={{
                      left: `${blackKeyLeftPercent(key.afterWhiteIndex!)}%`,
                      width: `${(1 / WHITE_KEY_COUNT) * 58}%`,
                      boxShadow: isActive
                        ? "inset 0 3px 8px rgba(0,0,0,0.45), 0 2px 6px rgba(31,29,26,0.25)"
                        : "0 8px 18px rgba(31,29,26,0.35), inset 0 -1px 0 rgba(255,255,255,0.06)",
                    }}
                    className={`absolute top-[3px] z-10 -translate-x-1/2 touch-manipulation rounded-b-[8px] bg-gradient-to-b from-[#3a3732] to-[#1f1d1a] ${blackKeyHeight}`}
                    aria-label={`${key.note}${showNumbers && keyNumbers?.[key.id] ? `, Nashville ${keyNumbers[key.id]}` : showNumbers ? `, Nashville ${key.nashville}` : ""}`}
                  >
                    <span
                      className={`absolute bottom-1.5 left-1/2 max-w-full -translate-x-1/2 truncate px-0.5 font-mono font-medium text-[#a39e96] ${keyLabelClass}`}
                    >
                      {getDisplayLabel(key)}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {(showHint || showScaleButton) && (
              <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                {showHint && (
                  <p className="font-mono text-[10px] tracking-[0.08em] text-muted sm:text-[11px]">
                    Tap the keys to hear the notes.
                  </p>
                )}
                {showScaleButton && (
                  <button
                    type="button"
                    onClick={() => void playLessonScale()}
                    disabled={inputLocked}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-walnut/25 bg-card/80 px-4 font-mono text-[10px] tracking-[0.1em] uppercase text-walnut transition-colors hover:border-walnut/45 hover:bg-card disabled:cursor-not-allowed disabled:opacity-50 sm:text-[11px]"
                  >
                    {playScaleLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
