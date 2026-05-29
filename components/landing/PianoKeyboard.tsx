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

const ease = [0.22, 1, 0.36, 1] as const;

const SCALE_NOTE_DURATION = 0.34;
const SCALE_STEP = 0.44;
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
  play145Progression: () => Promise<void>;
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
    },
    ref,
  ) {
    const [showNumbers, setShowNumbers] = useState(defaultShowNumbers);
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

    const playKeyIds = useCallback(
      async (keyIds: string[], duration = 1.1) => {
        const pitches = keyIds
          .map((id) => KEY_BY_ID[id]?.pitch)
          .filter(Boolean) as string[];
        if (pitches.length === 0) return;

        await ensureAudioStarted();
        setIsPlayingSequence(true);
        triggerNote(pitches, duration);
        flashKeys(keyIds, duration * 1000);

        const timeout = setTimeout(() => {
          setActiveKey(null);
          setIsPlayingSequence(false);
        }, duration * 1000);
        scaleTimeoutsRef.current.push(timeout);
      },
      [ensureAudioStarted, flashKeys, triggerNote],
    );

    const playCMajor = useCallback(async () => {
      if (isPlayingScale || isPlayingSequence) return;

      await ensureAudioStarted();
      clearScheduled();
      setIsPlayingScale(true);
      setActiveKey(null);
      setHighlightedKeys([]);
      onScalePlayed?.();

      const startTime = Tone.now();

      C_MAJOR_SCALE.forEach((keyId, index) => {
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

      const finishAt = C_MAJOR_SCALE.length * SCALE_STEP * 1000;
      const finishTimeout = setTimeout(() => {
        setIsPlayingScale(false);
        setActiveKey(null);
        setHighlightedKeys([]);
      }, finishAt);
      scaleTimeoutsRef.current.push(finishTimeout);
    }, [
      clearScheduled,
      ensureAudioStarted,
      isPlayingScale,
      isPlayingSequence,
      triggerNote,
    ]);

    const playChordByNumber = useCallback(
      async (number: "1" | "4" | "5") => {
        const chord = C_MAJOR_CHORDS[number];
        await playKeyIds([...chord.keyIds], 1.15);
      },
      [playKeyIds],
    );

    const play145Progression = useCallback(async () => {
      if (isPlayingSequence || isPlayingScale) return;

      await ensureAudioStarted();
      clearScheduled();
      setIsPlayingSequence(true);

      const chords = ["1", "4", "5"] as const;
      const chordDuration = 1.0;
      const step = 1.35;
      const startTime = Tone.now();

      chords.forEach((num, index) => {
        const chord = C_MAJOR_CHORDS[num];
        const pitches = chord.keyIds
          .map((id) => KEY_BY_ID[id]?.pitch)
          .filter(Boolean) as string[];
        const at = startTime + index * step;
        triggerNote(pitches, chordDuration, at);

        const highlightAt = index * step * 1000;
        const highlightTimeout = setTimeout(() => {
          setHighlightedKeys([...chord.keyIds]);
        }, highlightAt);
        scaleTimeoutsRef.current.push(highlightTimeout);

        const clearAt = highlightAt + chordDuration * 1000;
        const clearTimeoutId = setTimeout(() => {
          setHighlightedKeys([]);
        }, clearAt);
        scaleTimeoutsRef.current.push(clearTimeoutId);
      });

      const finishAt = chords.length * step * 1000;
      const finishTimeout = setTimeout(() => {
        setIsPlayingSequence(false);
        setHighlightedKeys([]);
      }, finishAt);
      scaleTimeoutsRef.current.push(finishTimeout);
    }, [
      clearScheduled,
      ensureAudioStarted,
      isPlayingScale,
      isPlayingSequence,
      triggerNote,
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
        playScale: playCMajor,
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
        play145Progression,
        clearHighlight: () => {
          setActiveKey(null);
          setHighlightedKeys([]);
        },
      }),
      [
        playCMajor,
        playChordByNumber,
        play145Progression,
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

    return (
      <div className="mx-auto w-full max-w-full select-none">
        <div
          className={`rounded-[1.75rem] border border-border-soft bg-card shadow-[0_2px_4px_rgba(31,29,26,0.04),0_20px_50px_-12px_rgba(31,29,26,0.18),inset_0_1px_0_rgba(247,241,231,0.9)] ${
            compact ? "rounded-2xl p-2.5 sm:p-3" : "p-4 sm:p-5 lg:rounded-[2rem] lg:p-6"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-3 border-b border-border-soft/80 ${
              compact ? "mb-2.5 pb-2" : "mb-5 gap-4 pb-4"
            }`}
          >
            <div>
              {!compact && (
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-olive">
                  SoundSteward
                </p>
              )}
              <p
                className={`font-medium tracking-tight text-text ${
                  compact ? "text-xs" : "mt-1 text-sm"
                }`}
              >
                Key of {keyLabel}
              </p>
              {!compact && (
                <p className="mt-0.5 font-mono text-[9px] tracking-[0.12em] uppercase text-muted">
                  Sound: Soft Piano
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowNumbers((value) => !value)}
              className="group flex items-center gap-2.5 rounded-full border border-border bg-section/80 px-3.5 py-2 transition-colors hover:border-walnut/30 hover:bg-section"
              aria-pressed={showNumbers}
            >
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted transition-colors group-hover:text-text">
                {showNumbers ? "Numbers" : "Notes"}
              </span>
              <span
                className={`relative h-[18px] w-[34px] rounded-full transition-colors ${
                  showNumbers ? "bg-walnut" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-[3px] size-3 rounded-full bg-card shadow-sm transition-transform ${
                    showNumbers ? "left-[17px]" : "left-[3px]"
                  }`}
                />
              </span>
            </button>
          </div>

          <div
            className={`relative rounded-2xl bg-section/70 shadow-[inset_0_2px_8px_rgba(31,29,26,0.06)] ${
              compact ? "p-2" : "p-3 sm:p-4"
            }`}
          >
            <div className={`relative ${compact ? "mb-1 h-4" : "mb-2 h-5"}`}>
              {showNumbers &&
                WHITE_KEYS.map((key, whiteIndex) => (
                  <div
                    key={`num-${key.id}`}
                    className="absolute bottom-0 flex justify-center"
                    style={{
                      left: `${whiteKeyLeftPercent(whiteIndex)}%`,
                      width: `${(1 / WHITE_KEY_COUNT) * 100}%`,
                    }}
                  >
                    <span className="font-mono text-[11px] font-medium tracking-wide text-walnut sm:text-xs">
                      {getDisplayLabel(key)}
                    </span>
                  </div>
                ))}
              {showNumbers &&
                BLACK_KEYS.map((key) => (
                  <div
                    key={`num-${key.id}`}
                    className="absolute bottom-0 -translate-x-1/2"
                    style={{
                      left: `${blackKeyLeftPercent(key.afterWhiteIndex!)}%`,
                    }}
                  >
                    <span className="font-mono text-[10px] font-medium tracking-wide text-clay sm:text-[11px]">
                      {getDisplayLabel(key)}
                    </span>
                  </div>
                ))}
            </div>

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
                    className={`relative z-0 min-w-0 flex-1 touch-manipulation ${
                      compact
                        ? "h-[88px] sm:h-[96px]"
                        : "h-[140px] sm:h-[152px] lg:h-[168px]"
                    } ${
                      index === 0
                        ? "rounded-l-[10px]"
                        : index === WHITE_KEYS.length - 1
                          ? "rounded-r-[10px]"
                          : ""
                    } border-r border-[#cfc3b0]/70 bg-gradient-to-b from-[#f7f1e7] via-[#f0e9dc] to-[#e8dfd0] last:border-r-0`}
                    aria-label={`${key.note}${showNumbers && keyNumbers?.[key.id] ? `, Nashville ${keyNumbers[key.id]}` : showNumbers ? `, Nashville ${key.nashville}` : ""}`}
                  >
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[11px] font-medium tracking-wide text-muted sm:bottom-3.5 sm:text-xs">
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
                    className={`absolute top-[3px] z-10 -translate-x-1/2 touch-manipulation rounded-b-[8px] bg-gradient-to-b from-[#3a3732] to-[#1f1d1a] ${
                      compact ? "h-[54px] sm:h-[58px]" : "h-[86px] sm:h-[94px] lg:h-[104px]"
                    }`}
                    aria-label={`${key.note}${showNumbers && keyNumbers?.[key.id] ? `, Nashville ${keyNumbers[key.id]}` : showNumbers ? `, Nashville ${key.nashville}` : ""}`}
                  >
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] font-medium tracking-wide text-[#a39e96] sm:text-[10px]">
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
                    onClick={() => void playCMajor()}
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
