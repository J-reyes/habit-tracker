# Habit Tracker — Phase 7 (ACTIVE)

> The only phase file to load during normal work. Shared context (data model,
> component hierarchy, critical files, checklist) lives in `../plan.md`.

## HabitItem card redesign (design handoff)

> **Added after Phase 5 shipped.** This phase **absorbs and replaces** the 7-day
> strip from Phase 6 brick 2 — build the strip here, as part of the new card, not
> as a bolt-on to the old checkbox layout. The empty-state half of Phase 6 brick 2
> is unaffected and still its own brick.

The spec for this phase is a **design handoff**, not written here — it lives in
`docs/handoff/` and is authoritative for the card's structure and styling:

| File | What it holds |
| --- | --- |
| `docs/handoff/IMPLEMENTATION_PLAN.md` | Files to touch, derived values, markup structure, day-7 behavior, a11y, and the **exact** style values (§8) |
| `docs/handoff/spec/2a-week.png` | Default state — ring + 7-day strip |
| `docs/handoff/spec/2a-month.png` | Expanded state — month grid, future days grayed |
| `docs/handoff/HabitItem Improvements.dc.html` | Clickable reference — open in a browser with `support.js` beside it, choose option **2a** |

**Read `docs/handoff/IMPLEMENTATION_PLAN.md` before describing or writing any
part of this phase.**

**Scope.** Only `src/lib/date.ts`, `src/components/HabitItem/HabitItem.tsx` and
`HabitItem.module.css` change. `App.tsx`, `HabitList.tsx`, `lib/streak.ts` and
`hooks/useLocalStorage.ts` stay as they are — `HabitItem`'s props are unchanged,
so nothing upstream needs editing. `currentStreak` / `longestStreak` already
supply the label numbers.

### Bricks

11. **Date helpers.** Add `lastNDaysISO(n, today)`, `monthGridISO(today)` and
    `weekdayInitials()` to `src/lib/date.ts`; `toISO` and `previousDayISO` stay.
    Nothing renders yet — verify by calling them. Same date discipline as Phase 3:
    delegate to `Date`, parse as `iso + 'T00:00:00'`, never hand-code month lengths.
12. **Week view.** Restructure `HabitItem.tsx` — ring button, title + streak label,
    7-day strip. The ring **is** today's toggle (`onToggleToday`); day cells are
    display-only in v1. Still unstyled — structure first.
13. **CSS module.** Replace the `grid-template-areas` layout with the flex shell in
    §3/§8. Delete the now-dead `.toggle` and `.stat` rules. Keep the existing card
    shell so it still matches `Header` and `AddHabitsForm`.
14. **Month view.** Add `const [view, setView] = useState<"week" | "month">("week")`
    — the card's *only* state. The grid, legend and summary line are all derived
    from `completedDates` + `monthGridISO`, same rule as everything else here.
15. **A11y + reduced motion.** `aria-pressed` on the ring, `aria-expanded` on the
    toggle, per-cell labels + a visually-hidden summary, and the ring transition
    wrapped in `@media (prefers-reduced-motion: reduce)` — `Header.module.css`
    already sets that precedent. Then walk §6's check-before-merge list.

### Open questions — decide before brick 12, and log the decision

- ✅ **Decided (brick 11): the week strip is a rolling last 7 days, ending today.**
  Reversed from the calendar-week idea so `lastNDaysISO` stays the strip's source.
  `monthGridISO` still pads to Sunday, so a fixed `["S","M","T","W","T","F","S"]`
  is correct there. The week strip *ends* on today, so its first column is
  whatever weekday it happens to be — the same fixed array would sit over the
  wrong cells on six days out of seven. Derive the week header from the actual
  ISO dates (`getDay()` indexes into `weekdayInitials()`). `weekdayInitials()`
  is still the letter source; it is just not a single layout for both headers.
  **Reconfirmed during brick 13:** `2a-week.png`'s header literally reads
  `S M T W T F S` because that's a hardcoded string in the mock, not a
  Sunday-alignment requirement — it only pictures one specific day (a
  Saturday). With the rolling strip, the header's first letter changes daily
  and will only match the mock's exact string on Saturdays; that is correct,
  expected behavior, not a bug.
- The initials array has duplicate letters, so it can never be a React `key` — use
  the index or the ISO date.
- §6's suggested order says "helpers + tests", but there's **no test runner
  installed**. Either verify the helpers in the browser console, or add vitest as
  its own brick first — a deliberate decision, not a silent `npm install`.

### New concepts (glossary, just-in-time)

`stroke-dasharray` / `stroke-dashoffset` (the ring-fill trick) · `aria-pressed` ·
`aria-expanded` · `prefers-reduced-motion` · `aspect-ratio`
