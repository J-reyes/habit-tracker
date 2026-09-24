# Habit Tracker

A small React practice app for tracking daily habits. Add habits, mark today done or not, and see current and longest streaks — all derived from a list of completed dates, not stored as separate fields.

Built as **project #6** in the Series II roadmap: persistence with `localStorage`, then extracting that read/write pair into a reusable `useLocalStorage<T>` custom hook.

## What it does

- **Add / delete habits** — each habit has a name and a list of completed days (`YYYY-MM-DD`)
- **Toggle today** — the progress ring is today’s check-off control
- **Streaks** — current and longest streak are computed from `completedDates` on every render
- **Week view** — last 7 days as a strip; ring fills over a repeating 7-day window (day 8 looks like day 1; the center number keeps climbing)
- **Month view** — calendar grid with done / missed / upcoming / today, plus a legend and “X of Y days so far” summary
- **Persistence** — habits survive refresh via `localStorage`

## Stack

- React 19 + TypeScript
- Vite
- CSS Modules

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build   # typecheck + production build
```

## Project layout (high level)

| Path | Role |
| --- | --- |
| `src/App.tsx` | Habits state, add / delete / toggle handlers |
| `src/hooks/useLocalStorage.ts` | Generic persist hook |
| `src/lib/date.ts` / `streak.ts` | ISO date helpers and streak math |
| `src/components/HabitItem/` | Card UI (ring, week strip, month grid) |

Learning notes live in `learning-log.md` and `plan.md`.
