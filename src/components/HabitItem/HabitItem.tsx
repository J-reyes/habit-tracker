import type { Habit } from "../../types";
import { lastNDaysISO, weekdayInitials, monthGridISO } from "../../lib/date";
import { useState } from "react";
import styles from "./HabitItem.module.css";

interface HabitItemProps {
  habit: Habit;
  today: string;
  streak: number;
  longestStreak: number;
  onDeleteHabit: (id: string) => void;
  onToggleToday: (id: string) => void;
}

function HabitItem({
  habit,
  today,
  streak,
  longestStreak,
  onDeleteHabit,
  onToggleToday,
}: HabitItemProps) {
  const [view, setView] = useState<"week" | "month">("week");

  const weekDays = lastNDaysISO(7, today);
  const ringFraction = Math.min(streak, 7) / 7;
  const strokeDashOffset = 2 * Math.PI * 20 * (1 - ringFraction);
  const monthDays: (string | null)[] = monthGridISO(today);
  // get done days for the current month, fitler only for the current month
  const doneDays = habit.completedDates.filter(
    (date) => date.startsWith(today.slice(0, 7)) && date <= today,
  );
  const elapsedDays = new Date(today + "T00:00:00").getDate();
  // for the button
  const done = habit.completedDates.includes(today);

  return (
    <li className={styles.card}>
      <div className={styles.header}>
        {view === "week" && (
          <button
            type="button"
            aria-pressed={done}
            aria-label={
              done ? "Mark as not done" : `Mark ${habit.name} as done for today`
            }
            className={styles.ring}
            onClick={() => onToggleToday(habit.id)}
          >
            <svg viewBox="0 0 46 46" aria-hidden="true">
              <g transform="rotate(-90 23 23)">
                <circle
                  className={styles.ringTrack}
                  cx="23"
                  cy="23"
                  r="20"
                  fill="none"
                  strokeWidth="4"
                />
                <circle
                  className={styles.ringFill}
                  cx="23"
                  cy="23"
                  r="20"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={strokeDashOffset}
                />
              </g>
            </svg>
            <span className={styles.ringCount}>{streak}</span>
          </button>
        )}
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>{habit.name}</h3>
          <p className={styles.stat}>
            {streak}-day streak • best {longestStreak}
          </p>
        </div>
        <button
          className={styles.viewToggle}
          onClick={() => setView(view === "week" ? "month" : "week")}
          aria-label="Toggle view"
          aria-expanded={view === "month"}
        >
          {view === "week" ? "View month" : "View week"}
        </button>
        <button
          className={styles.remove}
          type="button"
          onClick={() => onDeleteHabit(habit.id)}
        >
          Delete
        </button>
      </div>

      {view === "week" ? (
        <div className={styles.weekDays}>
          {weekDays.map((day) => {
            const done = habit.completedDates.includes(day);
            return (
              <div key={day} className={styles.dayColumn}>
                <span className={styles.weekdayLabel}>
                  {weekdayInitials()[new Date(day + "T00:00:00").getDay()]}
                </span>
                <span
                  className={done ? `${styles.day} ${styles.done}` : styles.day}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className={styles.monthGrid}>
            {weekdayInitials().map((letter, i) => (
              <span key={i} className={styles.monthWeekDay}>
                {letter}
              </span>
            ))}
            {monthDays.map((day, i) =>
              day === null ? (
                <span key={`blank-${i}`} />
              ) : (
                <span
                  key={day}
                  className={
                    habit.completedDates.includes(day)
                      ? `${styles.monthDay} ${styles.done}`
                      : day > today
                        ? `${styles.monthDay} ${styles.upcoming}`
                        : day === today
                          ? `${styles.monthDay} ${styles.today}`
                          : styles.monthDay
                  }
                />
              ),
            )}
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={`${styles.swatch} ${styles.done}`}></span>done
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.swatch} ${styles.missed}`}></span>
              missed
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.swatch} ${styles.upcoming}`}></span>
              upcoming
            </span>
          </div>
          <p className={styles.legendText}>
            {doneDays.length} of {elapsedDays} days so far • longest{" "}
            {longestStreak}d
          </p>
        </>
      )}
    </li>
  );
}

export default HabitItem;
