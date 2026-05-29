# SoundSteward Roadmap

SoundSteward teaches the Nashville Number System through interactive, game-like lessons. This document captures the current architecture and the planned path forward so new features stay aligned with the product vision.

---

## Current Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Audio | Tone.js (Salamander piano sampler) |
| State (client) | React hooks + `localStorage` |

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page |
| `/learn` | Major keys grid, progress bar, lesson modal |

### Directory Layout

```
app/
  page.tsx              # Landing page
  learn/page.tsx        # Learn hub — opens lessons by key ID

components/
  landing/              # Marketing UI + shared PianoKeyboard
  learn/                # LessonModal, KeysGrid, ProgressBar, hints

lib/
  lessons/
    types.ts            # Lesson + challenge type definitions
    engine.ts           # Prompts, feedback, piano mapping, resolution
    registry.ts         # lessons map + lookup helpers
    data/               # One file per key lesson (c-major.ts, g-major.ts)
  learn-progress.ts     # localStorage progress helpers
  major-keys.ts         # 12-key catalog + availability flags
  piano/                # Piano-specific assets (e.g. C Major chords)
```

### Design Principles

- **Data-driven lessons** — content lives in `lib/lessons/data/`, not in components.
- **Single-screen game loop** — one challenge at a time, piano always visible, auto-advance on correct answers.
- **Completion marks progress, never blocks access** — completed lessons can always be replayed or reviewed.
- **Warm, focused UI** — earthy palette, no scroll during lessons, Duolingo/Yousician-style flow.

### Key Components

| Component | Role |
|-----------|------|
| `LessonModal` | Generic lesson UI — challenges, hints, piano, completion screen |
| `PianoKeyboard` | Interactive one-octave keyboard; accepts per-lesson `noteToKeyId` and number labels |
| `KeysGrid` | 12 major key cards on `/learn` |
| `ProgressBar` | "X of 12 keys learned" summary |

---

## Lesson Engine

### Lesson Definition

Each lesson is a plain object (`LessonDefinition`) registered in `lib/lessons/registry.ts`:

```typescript
{
  id: "gMajor",
  keyId: "G",                    // Used for progress tracking
  title: "G Major",
  scale: ["G", "A", "B", "C", "D", "E", "F#"],
  numbers: { "1": "G", "2": "A", ... },
  noteToKeyId: { G: "g", "F#": "fs", ... },  // Piano key mapping
  completionMessage: "...",
  nextLessonLabel: "Next: D Major — Coming Soon",
  challenges: [ ... ]
}
```

### Challenge Types

| Type | Purpose | Piano input |
|------|---------|-------------|
| `findNumber` | Find a scale degree (e.g. "Find the 5 in G Major") | Note name |
| `findNote` | Identify the note for a number (e.g. "What note is the 6?") | Note name |
| `multipleChoice` | Custom prompt + choices | Optional (`note`, `number`, or `none`) |
| `hearAndIdentify` | Auto-plays a note; user identifies by ear | Note or number |

The engine (`lib/lessons/engine.ts`) resolves raw challenge data into `ResolvedChallenge` objects with prompts, feedback, and piano behavior.

### Lesson Flow

1. User selects a key on `/learn`.
2. `getLessonByKeyId(keyId)` loads the lesson from the registry.
3. `LessonModal` runs the challenge loop:
   - Show one challenge + choice buttons.
   - Accept answers via buttons or piano taps.
   - Correct → feedback, audio, key highlight → auto-advance after 1s.
   - Wrong → hint text; after 2 wrong attempts, show temporary reference card.
4. On completion → mark key learned, show replay / reset / continue options.

### Adding a New Key Lesson (~15 minutes)

1. Create `lib/lessons/data/<key>-major.ts` with scale, numbers, `noteToKeyId`, and ~10 challenges.
2. Register in `lib/lessons/registry.ts`:
   ```typescript
   export const lessons = {
     cMajor: cMajorLesson,
     gMajor: gMajorLesson,
     dMajor: dMajorLesson,  // new
   } as const;
   ```
3. Set `{ id: "D", available: true }` in `lib/major-keys.ts`.

No component changes required unless the lesson introduces a new challenge type.

### Shipped Lessons

| Key | File | Status |
|-----|------|--------|
| C | `lib/lessons/data/c-major.ts` | ✅ Live |
| G | `lib/lessons/data/g-major.ts` | ✅ Live |

---

## Progress System

### Current (localStorage)

| Key | Value |
|-----|-------|
| Storage key | `soundsteward-learned-keys` |
| Format | JSON array of key IDs, e.g. `["C", "G"]` |

**Helpers** (`lib/learn-progress.ts`):

- `getLearnedKeys()` — read completed key IDs
- `markKeyLearned(keyId)` — append on lesson completion (idempotent)
- `unmarkKeyLearned(keyId)` — remove on "Reset Progress"

Each key tracks independently. Completing C does not affect G.

### Lesson-Level State (session only)

Score, challenge index, and wrong-attempt counts live in `LessonModal` React state — not persisted. Replay always starts from challenge 1.

### Developer Reset

A discreet **Reset Local Progress** button on `/learn` calls `localStorage.clear()` and reloads the page.

### Future

See [Future Account System](#future-account-system-supabase) for cloud sync and cross-device progress.

---

## Planned Lesson Order

Lessons follow the **circle of fifths**, matching `MAJOR_KEYS` in `lib/major-keys.ts`:

| # | Key | Lesson file | Status |
|---|-----|-------------|--------|
| 1 | C | `c-major.ts` | ✅ Shipped |
| 2 | G | `g-major.ts` | ✅ Shipped |
| 3 | D | `d-major.ts` | 🔲 Planned |
| 4 | A | `a-major.ts` | 🔲 Planned |
| 5 | E | `e-major.ts` | 🔲 Planned |
| 6 | B | `b-major.ts` | 🔲 Planned |
| 7 | F# | `f-sharp-major.ts` | 🔲 Planned |
| 8 | Db | `db-major.ts` | 🔲 Planned |
| 9 | Ab | `ab-major.ts` | 🔲 Planned |
| 10 | Eb | `eb-major.ts` | 🔲 Planned |
| 11 | Bb | `bb-major.ts` | 🔲 Planned |
| 12 | F | `f-major.ts` | 🔲 Planned |

### Per-Lesson Template (~10 challenges)

Each key lesson should cover the same skills, adapted to that scale:

1. **findNumber** × 3 — degrees 1, 5, 4 (or similar spread)
2. **multipleChoice** × 2–3 — "What number is X?" / theory checks
3. **findNote** × 2 — identify notes for scale degrees
4. **hearAndIdentify** × 2 — ear training on 1 and 5
5. **multipleChoice** × 1 — quick check (e.g. 1-4-5 equals …)

### Piano Considerations for Future Keys

The keyboard is one octave (C4–C5). Keys with notes outside this range (e.g. Eb, Ab) will need either:

- A transposed display octave, or
- An expanded / shiftable keyboard view

Document the chosen approach when building lesson 8+.

---

## Nashville Number Roadmap

The 12 major key lessons are **Phase 1** — building fluency with scale degrees in every key.

### Phase 1 — Major Keys *(in progress)*

- [x] Lesson engine + reusable UI
- [x] C Major
- [x] G Major
- [ ] Remaining 10 major keys
- [ ] Unlock "Nashville Numbers" section when all 12 complete

### Phase 2 — Chord Functions

Teach what numbers *mean* harmonically, not just note names:

- Major triads: 1, 4, 5
- Minor triads: 2, 3, 6
- Diminished: 7
- Interactive chord playback on piano (partially exists on landing page via `C_MAJOR_CHORDS`)

**Challenge types to add:**

- `hearChord` — identify chord by number
- `buildChord` — tap all notes in a chord
- `chordQuality` — major vs minor by ear

### Phase 3 — Common Progressions

- 1-4-5-1
- 1-6-4-5
- 2-5-1
- Number-first thinking: "play a 6-4-1-5 in G"

### Phase 4 — Minor Keys & Modal Borrowing

- Relative minor (6 minor)
- Parallel minor
- Borrowed chords (b7, etc.)

### Phase 5 — Applied Practice

- Transpose a progression to any key
- Real song breakdowns (numbers only — no copyright lyrics)
- "Jam mode" — random progression, user plays along

---

## Progression Explorer Roadmap

A dedicated tool for hearing and understanding chord movement by number — separate from the lesson game loop but sharing the piano engine.

### Vision

> Pick a key. Pick a progression. Hear it. See the numbers move.

### MVP Features

- [ ] Key selector (12 major keys)
- [ ] Progression presets (1-4-5-1, 1-6-4-5, 2-5-1, custom)
- [ ] Play / loop progression with animated number highlights on piano
- [ ] Display numbers + note names simultaneously
- [ ] Tempo control

### v2 Features

- [ ] Custom progression builder (tap numbers to build a sequence)
- [ ] Inversions and voicing options
- [ ] Export progression as numbers (shareable text: `G: 1-6-4-5`)
- [ ] Compare same progression across two keys side-by-side

### v3 Features

- [ ] Minor key support
- [ ] Rhythm / strum patterns
- [ ] Integration with lesson unlocks ("You've learned 1-4-5 — try it in every key")

### Technical Notes

- Reuse `PianoKeyboard` ref API (`playKeyIds`, `play145Progression`).
- Generalize `C_MAJOR_CHORDS` into a key-agnostic chord map: `lib/piano/chords.ts`.
- New route candidate: `/explore` or `/progressions`.

---

## Future Account System (Supabase)

Today all progress is local. Supabase will enable accounts, cloud sync, and analytics without rewriting the lesson engine.

### Why Supabase

- Auth (email, OAuth) out of the box
- Postgres for structured progress and lesson metadata
- Row Level Security for per-user data
- Realtime optional for future social/teacher features

### Proposed Schema (draft)

```sql
-- Users handled by Supabase Auth (auth.users)

profiles (
  id          uuid primary key references auth.users,
  display_name text,
  created_at  timestamptz
)

lesson_progress (
  user_id     uuid references profiles,
  key_id      text,          -- "C", "G", etc.
  completed_at timestamptz,
  best_score  int,
  primary key (user_id, key_id)
)

lesson_attempts (
  id          uuid primary key,
  user_id     uuid references profiles,
  lesson_id   text,          -- "cMajor"
  score       int,
  completed   boolean,
  created_at  timestamptz
)
```

### Migration Path

1. **Keep localStorage as fallback** — guest mode always works.
2. **On sign-in** — merge local progress into Supabase (prefer cloud if conflict).
3. **Abstract progress API** — replace direct `localStorage` calls with a `ProgressService` interface:
   ```typescript
   interface ProgressService {
     getLearnedKeys(): Promise<string[]>;
     markKeyLearned(keyId: string): Promise<void>;
     unmarkKeyLearned(keyId: string): Promise<void>;
   }
   ```
4. **Implement** `LocalProgressService` (current) and `SupabaseProgressService`.
5. **Add auth UI** — sign in / sign up in header; profile page with progress summary.

### Not in Scope Yet

- Payments / subscriptions
- Teacher dashboards
- Leaderboards

---

## Near-Term Priorities

1. **D Major lesson** — next key in circle of fifths
2. **Piano generalization** — chord maps and number labels for any key
3. **Progress service abstraction** — prep for Supabase without blocking shipping
4. **Progression Explorer MVP** — leverage existing audio infrastructure

---

## Contributing Notes

- Run `npm run dev` for local development.
- Run `npm run build` before merging — TypeScript must pass.
- New lessons: data file + registry entry + `available: true` in `major-keys.ts`.
- Do not commit secrets or `.env` files.
- Completion should never lock users out of replay.

---

*Last updated: May 2026*
