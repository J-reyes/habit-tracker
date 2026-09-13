# Habit card (2a) handoff

Drop this folder anywhere in your habit-tracker workspace (e.g. `docs/habit-card/`) so Cursor can read it.

## Contents
- `IMPLEMENTATION_PLAN.md` — the change plan: files to touch, derived values, markup structure, day-7 behavior, a11y, exact style values (§8).
- `spec/2a-week.png` — default state: ring + 7-day strip.
- `spec/2a-month.png` — expanded state: month grid, future days grayed.
- `HabitItem Improvements.dc.html` + `support.js` — the live, clickable design doc. Open the HTML in a browser (keep `support.js` beside it) and use option **2a**; clicking the ring and "View month" shows the real interaction.

## Source of truth
Target repo: `J-reyes/habit-tracker@main`. Only `src/lib/date.ts`, `src/components/HabitItem/HabitItem.tsx` and `HabitItem.module.css` change; `App.tsx`, `HabitList.tsx`, `streak.ts` and `useLocalStorage.ts` stay as they are.

## Suggested Cursor prompt
> Read IMPLEMENTATION_PLAN.md and the two PNGs in spec/. Implement step 1 only (the date helpers in src/lib/date.ts) and stop. Use the exact color and size values in §8 — do not invent new tokens; reuse the CSS variables already in src/index.css.

Then work step by step (helpers → week view → CSS → month view → a11y), reviewing each before moving on.
