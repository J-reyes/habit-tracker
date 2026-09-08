import type { Habit } from "../../types";
import { currentStreak } from "../../lib/streak";
import HabitItem from "../HabitItem/HabitItem";

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
    <ul>
      {habits.map((habit) => (
        <HabitItem
          key={habit.id}
          habit={habit}
          today={today}
          onDeleteHabit={onDeleteHabit}
          onToggleToday={onToggleToday}
          streak={currentStreak(habit.completedDates)}
        />
      ))}
    </ul>
  );
}

export default HabitList;
