export type MajorKey = {
  id: string;
  label: string;
  available: boolean;
};

export const MAJOR_KEYS: MajorKey[] = [
  { id: "C", label: "C", available: true },
  { id: "G", label: "G", available: true },
  { id: "D", label: "D", available: true },
  { id: "A", label: "A", available: true },
  { id: "E", label: "E", available: true },
  { id: "B", label: "B", available: true },
  { id: "F#", label: "F#", available: true },
  { id: "Db", label: "Db", available: true },
  { id: "Ab", label: "Ab", available: true },
  { id: "Eb", label: "Eb", available: true },
  { id: "Bb", label: "Bb", available: true },
  { id: "F", label: "F", available: true },
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
