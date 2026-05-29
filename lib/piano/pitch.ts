const CHROMA: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const CHROMA_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export function noteNameToChroma(note: string): number {
  const value = CHROMA[note];
  if (value === undefined) {
    throw new Error(`Unknown note name: ${note}`);
  }
  return value;
}

export function midiToPitch(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const chroma = ((midi % 12) + 12) % 12;
  return `${CHROMA_NAMES[chroma]}${octave}`;
}

/** Returns ascending pitch names within one octave, bumping octave only when needed. */
export function getAscendingPitches(
  noteNames: readonly string[],
  startOctave = 4,
): string[] {
  let lastMidi = -1;
  let octave = startOctave;

  return noteNames.map((noteName) => {
    const chroma = noteNameToChroma(noteName);
    let midi = (octave + 1) * 12 + chroma;

    if (lastMidi >= 0 && midi <= lastMidi) {
      octave += 1;
      midi = (octave + 1) * 12 + chroma;
    }

    lastMidi = midi;
    return midiToPitch(midi);
  });
}
