# Habit Tracker — Learning Log, Archive 1 (Phases 0–5, Bricks 1–10)

> Archived from `../learning-log.md`. Do not load during normal work — grep it
> if you need to check whether a concept was already covered.

## Phase 0–1: Scaffold + Add a Habit (Bricks 1–3)

**Concepts:** Recall-only implementation, controlled input, immutable list add, state-shape minimalism

**Why it matters:** This is the first *recall brick* of the project — no spec-level teaching, just building "add a habit" from memory against the shopping-list / mini-trello pattern. The point isn't the code (I've written it twice already); it's the friction. Where fingers stall, where the wrong shape gets reached for — that's what the log catches.

**Key insights:**

- **Match state shape to what state actually is.** First pass used `useState({ name: "" })` for a single input field, then `setItem({ ...item, name: e.target.value })` to update it. The Python instinct — wrap things in a dict "in case I add fields later" — is the wrong reach in React. If the state is one string, use `useState<string>("")`. YAGNI applies to state shape as much as to features; grow the type when a second field actually shows up, not before.

- **Lowest common owner for UI state.** The habits list lives in `App` (multiple children read it). The input's current text lives in `AddHabitsForm` (nothing outside cares). Conflating "state" (the list) with "state" (the input string) misplaces the second one — putting the input in `App` would re-render the whole tree on every keystroke for no reason. Rule: state lives at the *lowest* component that needs it.

- **`React.FormEvent` is deprecated in current `@types/react`.** The correct type for form submit handlers is now `React.SubmitEvent<HTMLFormElement>` (and `SubmitEventHandler` instead of `FormEventHandler`). The DOM has always had a real `SubmitEvent`; React's `FormEvent` was a legacy misnomer and is now flagged in the type definitions themselves. Verify against `node_modules/@types/react/index.d.ts` rather than trusting stale StackOverflow / mentor authority.

- **Presentational chain stayed clean.** `App → AddHabitsForm | HabitList → HabitItem`. Only `App` holds `habits`. `HabitList` and `HabitItem` are pure prop-in, JSX-out — no state, no handlers computing policy. This is the shape every subsequent brick will extend.

**Component hierarchy built:** `App` → `Header` | `AddHabitsForm` | `HabitList` → `HabitItem`

---

## Phase 1: Delete a Habit (Brick 4)

**Concepts:** `.filter` as an immutable sieve, functional updater form, "wrap only when adding an argument" (payoff from mini-trello)

**Why it matters:** Delete is the smallest immutable update pattern — a single `.filter` call. It's also the first place in this project to *not* need a callback wrapper in the middle of the chain. Getting that right is a spaced-repetition win from Mini Trello.

**Key insights:**

- **`.filter` is a sieve, not a subtractor.** The predicate answers *"what survives?"*, not *"what gets removed?"*. Reading `prev.filter((h) => h.id !== id)` as *"let through every habit whose id isn't the target"* prevents the classic bug of inverting the predicate and keeping only the thing you wanted to delete. `.filter` also returns a **new array** — the source is never mutated, which is what makes it safe as a state update.

- **Functional updater form: `setHabits((prev) => ...)`.** Reads the current state from an argument React hands in, instead of from the closure that captured `habits` at handler-definition time. Overkill for a single click, but the habit prevents stale-closure bugs when multiple updates fire in the same tick (e.g. rapid deletes). Cost is zero; benefit is real once state gets non-trivial.

- **The child owns the id → no wrapper in `HabitList`.** `HabitItem` has `habit.id` and calls `onDeleteHabit(habit.id)` itself. `HabitList` passes the callback through unwrapped (`onDeleteHabit={onDeleteHabit}`). This is the **contrast case** to Mini Trello's *add card*, where the parent (`Board`) knew `column.id` and the child didn't, so a wrapper (`(title) => onAddCard(column.id, title)`) was justified. Same rule, both directions: *wrap only when you're adding or transforming an argument.* If the child can already call the callback with everything it needs, don't manufacture a new function.

- **Named handler vs inline arrow — a judgment call.** Extracting `handleDelete` in `HabitItem` when the body is a one-liner is fine but not required. The named form pays off when the body grows (validation, confirmation dialogs, multiple side effects) or the handler is reused. For a pure forward, inline is equally clean.

---

## Phase 2: Toggle Today (Brick 5)

**Concepts:** ISO date strings, immutable *nested* update (toggle add/remove), derive-don't-store, the timezone-off-by-one gotcha

**Why it matters:** This is the first update that changes a field *inside* an element rather than the list's shape — the nested-immutable pattern every real app leans on. And it's where the project's central date discipline first bites.

**Key insights:**

- **Store dates as `'YYYY-MM-DD'` strings, not `Date` objects.** They JSON-serialize cleanly (needed for Phase 4 persistence) and, because the format is fixed-width, string comparison *is* date comparison. `toISO(date)` centralizes the conversion — built with `Intl.DateTimeFormat('sv-SE', ...)` because the Swedish locale emits exactly `YYYY-MM-DD` and formats in **local** time by default (dodging UTC-shift). A hand-rolled `getFullYear()/getMonth()+1/padStart` version is equally valid — trades cleverness for explicitness.

- **Toggle = one immutable nested update.** `setHabits(prev => prev.map(...))`: matching habit returns a *copy* (`{ ...habit, completedDates: ... }`) with a *new* array; every other habit is returned by reference, untouched. The inner decision is `includes(todayISO) ? filter-it-out : [...spread, todayISO]` — both branches produce a new array (never `.push`). Reading `.filter((d) => d !== todayISO)` correctly: it *keeps everything that isn't today* (removes today), not "returns today."

- **"Done today" is derived, never stored.** `checked={completedDates.includes(today)}` computes the checkbox state during render. No `doneToday` field on `Habit` — a stored flag could drift out of sync with `completedDates`; deriving makes it correct by construction. (Same rule retired the `currentStreak`/`longestStreak` fields too.)

- **🪳 Timezone-off-by-one — the headline trap, caught live in test data.** `new Date('2026-09-02')` parses as **UTC midnight**; in UTC-7 that's 5pm *Sep 1* local, so `toISO` reads it back as `'2026-09-01'` — a silent one-day shift. The checkbox for a habit that "included today" stayed empty because the stored date had drifted. Fixes: keep dates as plain strings (no `Date` round-trip), or parse as `new Date(iso + 'T00:00:00')` to force local midnight. This is exactly the parse discipline Brick 6's `previousDay` will require. (Glossary: `ISO date string`, `timezone-off-by-one`.)

---

## Phase 3: Current Streak (Brick 6)

**Concepts:** Derived streak (not stored), `Set` + backward walk, `previousDayISO` via `Date.setDate`, grace-until-midnight rule, per-habit derivation site

**Why it matters:** Streak is pure derivation from `completedDates` — the same "don't store what you can compute" rule as "done today." The date math is the real trap: never hand-code month lengths; delegate to `Date`.

**Key insights:**

- **Algorithm:** `Set(completedDates)` → cursor starts at today (or yesterday if today isn't done) → `while` cursor is in the set, count++ and step to `previousDayISO`. First gap stops the loop. Recursing with the *same* array forever = stack overflow; the cursor must move.

- **Design call — grace until midnight:** Missing *today* does not kill the streak while the calendar day is still open. Start at yesterday instead. When the clock rolls and yesterday is missing → 0. No special midnight check — `toISO(new Date())` already is "what day is it now."

- **`new Set(...)` not `Set(...)`.** JS constructors need `new` (unlike Python's `set(...)`).

- **Per habit, not flatMap.** Merging every habit's dates into one Set made both rows show 3. Streak is a property of *one* habit's history. Natural call site: inside `HabitList`'s `.map` where `habit` already exists — `HabitItem` only receives the number.

- **`previousDayISO`:** parse as local midnight (`iso + 'T00:00:00'`), `setDate(getDate() - 1)`, format with `toISO`. Month/year/leap boundaries come free.

---

## Phase 3: Longest Streak (Brick 7)

**Concepts:** Two counters (`run` vs `best`), adjacency as a *pair* property, capturing a max inside the loop, pure functions return values

**Why it matters:** Same derivation rule as current streak, but the walk isn't anchored to today — so the answer can be anywhere in the history. That's what forces a second counter.

**Key insights:**

- **Adjacency needs two elements.** The check is `previousDayISO(sorted[i]) === sorted[i - 1]` — the *calendar* predecessor vs the *array* predecessor. Index 0 has no array predecessor, so it falls to the `else` and seeds the run at 1. Nothing is skipped; the first element is where the run starts.

- **Two counters, two jobs.** `run` is "the streak I'm in right now" — it resets to 1 at every gap. `longest` is "the best I've ever seen" — it never resets. Using one variable for both erases the record the moment a gap appears.

- **🪳 The max must be captured *inside* the loop.** Placed after the loop, it only sees the run that happened to be in progress at the end. Test data with the longest run last passed anyway — a false green. Bug classes hide behind unlucky test data; vary *where* the interesting case sits (start / middle / end).

- **`Math.max(a, b)` returns a value, it doesn't mutate.** `Math.max(longest, run);` on a bare line computes and discards. Needs the assignment: `longest = Math.max(longest, run)` — and then the wrapping `if` is redundant, since max already means "keep the bigger one."

- **`.sort()` mutates in place** → sort a copy (`[...completedDates].sort()`), never state directly. Plain `.sort()` needs no comparator because ISO strings sort chronologically.

---

## Phase 4: Persist to localStorage, Inline (Bricks 8–9)

**Concepts:** Lazy `useState` initializer, effect-on-change as synchronization, watching outcomes instead of causes

**Why it matters:** Second instance of the same rule from Focus Timer — *effects are for synchronizing with external systems*. There the system was `setInterval`; here it's `localStorage`. Written **inline on purpose** so the duplication is felt before Phase 5 extracts it.

**Key insights:**

- **Lazy initializer: the `() =>` is load-bearing.** `useState(() => read())` runs the reader **once, on mount**. `useState(read())` calls it on *every* render and discards the result, since React only uses the argument the first time. Use it whenever computing the initial value costs something.

- **`getItem` returns `null` when the key is missing,** and `JSON.parse(null)` returns `null` rather than throwing — so the crash lands later, at `habits.map(...)`. The `raw ? JSON.parse(raw) : []` guard is what makes the first load safe.

- **Watch the outcome, not the causes.** The alternative was `setItem` at the end of all three handlers: three copies, and every future handler another chance to forget. One `useEffect` keyed on `[habits]` fires no matter which handler caused the change. Handlers describe causes; the effect reacts to the resulting value.

- **Order of operations:** `setHabits` → React re-renders → *then* React compares the dep array and runs the effect. The effect doesn't trigger the render; it runs after one.

- **No cleanup here.** `setItem` leaves no subscription behind — contrast the timer's `clearInterval`. Cleanup is for teardown, not a reflex.

- **The duplication to notice:** a `getItem` + `parse` + fallback read and a `stringify` + `setItem` write, both hardwired to the key `'habits'` and the type `Habit[]`. One unit, split across two places. That's the cue for the hook.

---

## Phase 5: Extract `useLocalStorage<T>` (Brick 10) — headline deliverable

**Concepts:** Custom hooks, generic `<T>`, `as const` tuples, what a dependency array actually declares

**Why it matters:** The payoff for writing the read and write inline first. Extraction isn't new machinery — every line already existed. It's *naming a pattern you already had*, which is why the plan refused to introduce it abstractly.

**Key insights:**

- **A custom hook is just a function starting with `use` that calls other hooks.** No new API. The `use` prefix is what lets React's lint rules enforce the rules of hooks inside it. Extracting one shares the *logic*, not the state — every caller gets its own independent value.

- **Generic names inside, specific names at the call site.** The hook's variables are `key`/`value`/`initial`; `App` names them `habits`/`setHabits`. Leaving `habits` inside the hook is the extraction's fingerprint — it makes a general-purpose function read as single-purpose.

- **🪳 A dependency array is not the `useState` pair.** Real confusion this step: `[value, setValue]` looked like the natural array because that's what `useState` returns. Wrong list. The dep array answers *"which values, if different from last render, should re-run this effect?"* — so you read the effect **body** and list what it uses. Body reads `key` and `value` → `[key, value]`. `setValue` is never in the body, and React keeps setter identity stable anyway, so it could never fire.

- **Parameterizing a literal makes it a dependency.** `'habits'` was hardcoded and therefore couldn't change; as the `key` parameter it can, so the effect must now depend on it. Every constant you turn into an argument becomes something that can vary.

- **`as const` on the returned pair** makes TS infer a tuple (`[T, setter]`) rather than a widened array of the union — that's what keeps `habits` typed as `Habit[]` after destructuring.

- **The test of a good extraction is that nothing observable changes.** Same behavior, same stored JSON, fewer lines in `App`. Code moved; no feature added.

---
