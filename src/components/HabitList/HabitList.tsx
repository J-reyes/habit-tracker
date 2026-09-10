import type { Habit } from "../../types";
import { currentStreak, longestStreak } from "../../lib/streak";
import HabitItem from "../HabitItem/HabitItem";
import styles from "./HabitList.module.css";

interface HabitListProps {
  habits: Habit[];
  today: string;
  onDeleteHabit: (id: string) => void;
  onToggleToday: (id: string) => void;
}

function HabitList({
  habits,
  today,
  onDeleteHabit,
  onToggleToday,
}: HabitListProps) {
  return (
    <ul className={styles.list}>
      {habits.map((habit) => (
        <HabitItem
          key={habit.id}
          habit={habit}
          today={today}
          onDeleteHabit={onDeleteHabit}
          onToggleToday={onToggleToday}
          streak={currentStreak(habit.completedDates)}
          longestStreak={longestStreak(habit.completedDates)}
        />
      ))}
    </ul>
  );
}

export default HabitList;
