export type MajorKey = {
  id: string;
  label: string;
  available: boolean;
};

export const MAJOR_KEYS: MajorKey[] = [
  { id: "C", label: "C", available: true },
  { id: "G", label: "G", available: true },
  { id: "D", label: "D", available: true },
  { id: "A", label: "A", available: false },
  { id: "E", label: "E", available: false },
  { id: "B", label: "B", available: false },
  { id: "F#", label: "F#", available: false },
  { id: "Db", label: "Db", available: false },
  { id: "Ab", label: "Ab", available: false },
  { id: "Eb", label: "Eb", available: false },
  { id: "Bb", label: "Bb", available: false },
  { id: "F", label: "F", available: false },
];

export const C_MAJOR_NUMBERS = [
  { number: "1", note: "C" },
  { number: "2", note: "D" },
  { number: "3", note: "E" },
  { number: "4", note: "F" },
  { number: "5", note: "G" },
  { number: "6", note: "A" },
  { number: "7", note: "B" },
] as const;
