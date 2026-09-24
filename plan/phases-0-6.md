# Habit Tracker — Phases 0–6 (complete)

> Archived. Bricks 1–10 shipped; see `../learning-log.md` for what each taught.
> Load this only to check a past decision. Active work: `phase-7.md`.

## Bricks



### Phase 0 — Scaffold (2 bricks)

1. `npm create vite@latest habit-tracker -- --template react-ts` → verify dev server runs.
  > ⚠️ This directory already contains `plan.md`. Vite will prompt because it's not empty — choose **"Ignore files and continue"**, *not* "Remove existing files".
2. Clear boilerplate per `rules/react.md`. Create `src/types.ts` with the `Habit` type, and `src/components/{Header,AddHabitForm,HabitList,HabitItem}/` with placeholders + `.module.css`. `Header` is a static stub for now — just the app name in an `<h1>`.



### Phase 1 — Static CRUD (2 bricks) — *recall, spec-only*

1. `habits` state (`Habit[]`), `AddHabitForm` controlled input, `onAdd` creates a habit with a fresh `id` (`crypto.randomUUID()`) and `completedDates: []`. Render the list.
  - No hints. This is shopping-list / trello territory. Immutable add: `[...habits, newHabit]`.
2. Delete a habit (`onDelete`, filter by id). Immutable, update-by-id from memory.



### Phase 2 — Toggle today (1 brick) — *recall, spec-only*

1. `onToggleToday(id)`: if `todayISO` is in that habit's `completedDates`, remove it; else add it. **Immutable nested update** — map over `habits`, and for the matching id return a new habit with a new `completedDates` array (never `.push`). "Done today?" is *derived* in `HabitItem` from `completedDates.includes(todayISO)` — not a stored flag. Verify the checkbox/button reflects it and survives adding other habits.

> `todayISO` — a single source for "today" as `'YYYY-MM-DD'`. Define one helper (`toISO(new Date())`) and reuse it; don't recompute the format in three places.

---



### Phase 3 — 🧠 Streaks (2 bricks — the recall centerpiece, with one real trap)

**6. Current streak — you write the algorithm, from memory.**

Derive: starting at today, count consecutive days present in `completedDates`, stopping at the first gap. A `Set` makes the lookup clean:

```ts
const done = new Set(habit.completedDates);
// start at todayISO, step to the previous day while done.has(cursor)
```

**The date trap — bank this before you write the loop, it's the whole reason this brick isn't trivial:** to get "the day before this ISO date," **delegate to** `Date` **— never hand-code month lengths.** `Date` already knows Feb 2028 has 29 days.

```ts
function previousDay(iso: string): string {
  const d = new Date(iso + 'T00:00:00');   // ← local midnight, see gotcha
  d.setDate(d.getDate() - 1);              // rolls back across month/year/leap correctly
  return toISO(d);
}
```

- `setDate(0)` (or below) automatically rolls into the previous month at its correct length. You will **never** write `if (month === 2)`.
- **⚠️ Timezone-off-by-one gotcha:** parse as `new Date(iso + 'T00:00:00')` (local midnight), **not** bare `new Date('2028-03-01')` — the bare ISO string is parsed as **UTC** midnight, and in any timezone behind UTC it reads back as the *previous* day. This is the most common date bug there is. Goes in the glossary.
- **Design call to decide and log:** does the streak require *today* to be done, or does yesterday-and-back still "count" until the day ends? Argue one, implement it, write it in the log.

**7. Longest streak — derived, displayed per habit.**

Longest consecutive run *anywhere* in `completedDates` (not anchored to today). Sort the dates, walk them, reset the run counter at each gap (use `previousDay` / adjacency, same date discipline). Return the max run seen. Show it in `HabitItem` next to the current streak. Empty history → `0`.

---



### Phase 4 — 🧠 Persist, INLINE (2 bricks — the setup for the payoff)

> **Do not extract a hook yet.** The point of this phase is to write the read and the write as two separate inline pieces so the duplication is *felt* in the next phase. Resisting early abstraction is the lesson.

**8. Read on mount — lazy** `useState` **initializer.**

```tsx
const [habits, setHabits] = useState<Habit[]>(() => {
  const raw = localStorage.getItem('habits');
  return raw ? JSON.parse(raw) : [];
});
```

Concept, just-in-time: the **lazy initializer** — passing a *function* to `useState` runs it **once, on mount**, instead of every render. Reading + `JSON.parse`ing localStorage is work you want done once; `useState(() => ...)` is how you say "compute the initial value lazily." Passing `useState(readFn())` (calling it) would run it every render and throw the result away — the `() =>` is load-bearing. Glossary.

Verify: it reads back `[]` cleanly on first load (no crash on `null`).

**9. Write on change — effect-on-change.**

```tsx
useEffect(() => {
  localStorage.setItem('habits', JSON.stringify(habits));
}, [habits]);
```

Concept: this is the **same synchronization** as the timer's interval effect — keep an external system (`localStorage`) in sync with state (`habits`) whenever it changes. The dependency array `[habits]` says "re-sync when habits change." No cleanup needed here (nothing to tear down — contrast the interval).

Verify **real behavior**: add habits, check some off, **refresh the page** — they persist. Open DevTools → Application → Local Storage to see the JSON.

> At the end of this phase, stop and *look* at bricks 8 and 9 side by side: a `getItem`+`parse`+fallback read, and a `stringify`+`setItem` write, both hard-coded to the key `'habits'`. That paired read/write, tied to one key and one type, is a **unit**. That felt duplication is the cue for Phase 5 — don't move on until you can see it.

---



### Phase 5 — 🧠 EXTRACT THE HOOK (1 brick — the headline gap)

**10.** `useLocalStorage<T>` **— pulled out of bricks 8 + 9.**

Extract the read/write pair into a generic custom hook in `src/hooks/useLocalStorage.ts`:

```ts
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}
```

Then `App` collapses to one line: `const [habits, setHabits] = useLocalStorage<Habit[]>('habits', [])`.

Concepts, just-in-time:

- **A custom hook is just a function starting with** `use` **that calls other hooks.** No new React API — you already wrote every line in Phases 4. Extraction ≠ new machinery; it's *naming a pattern you already have*. Glossary.
- **Generic** `<T>` so it works for `Habit[]` today and any serializable shape tomorrow — `TypeVar` from Python typing. The `<T>` already has a glossary entry; here it gets *used*.
- `as const` on the returned tuple so TS infers `[T, setter]` (a fixed-length tuple) instead of a widened `(T | setter)[]` array — that's what lets destructuring keep both types.

Verify: identical behavior to before (refresh still persists). **The test of a good extraction is that nothing observable changes** — you moved code, you didn't add a feature.

---



### Phase 6 — Polish (2 bricks)

1. **Eye-catching** `Header`**.** Style the app-name header so it draws the eye — large weight, a gradient or accent color, generous spacing. Its own brick because "make it exist" (brick 2) and "make it striking" are different concerns. Presentational only.
2. **Empty state + last-7-days strip.** When `habits` is empty, show a friendly prompt instead of a bare list. In `HabitItem`, render a small strip of the last 7 days (derive the 7 ISO dates via `previousDay`, mark which are in `completedDates`) — a visual history. *All derived, no new state.*

---



### Stretch Goals (each one brick, hardest last)

1. **S1 — Guard localStorage against corruption.** `JSON.parse` throws on malformed data (hand-edit the value in DevTools to prove it). Wrap the read in `try/catch`, fall back to `initial`. Turns the hook from "works" into "robust."
2. **S2 —** `useLocalStorage` **for a second thing.** Persist a UI preference (e.g. a filter, or sort order) with the *same* hook — the payoff of having extracted it. One call site proves reuse; two prove the abstraction.
3. **S3 — Cross-tab sync.** The `storage` event fires in *other* tabs when localStorage changes. A second effect subscribing to `window`'s `storage` event (with cleanup — back to the timer's teardown rule) keeps two open tabs in sync. A genuinely different external system, and cleanup earns its place again.

---
