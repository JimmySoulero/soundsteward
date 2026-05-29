export const LEARNED_KEYS_STORAGE = "soundsteward-learned-keys";

export function getLearnedKeys(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(LEARNED_KEYS_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function markKeyLearned(keyId: string): string[] {
  const current = getLearnedKeys();
  if (current.includes(keyId)) return current;

  const updated = [...current, keyId];
  localStorage.setItem(LEARNED_KEYS_STORAGE, JSON.stringify(updated));
  return updated;
}

export function unmarkKeyLearned(keyId: string): string[] {
  const current = getLearnedKeys();
  const updated = current.filter((id) => id !== keyId);
  localStorage.setItem(LEARNED_KEYS_STORAGE, JSON.stringify(updated));
  return updated;
}

export const TOTAL_MAJOR_KEYS = 12;
