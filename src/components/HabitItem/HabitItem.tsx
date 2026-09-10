import type { Habit } from "../../types"
import styles from "./HabitItem.module.css"

interface HabitItemProps {
    habit: Habit
    today: string
    streak: number
    longestStreak: number
    onDeleteHabit: (id: string) => void
    onToggleToday: (id: string) => void
}

function HabitItem({ habit, today, streak, longestStreak, onDeleteHabit, onToggleToday }: HabitItemProps) {
    return (
        <li className={styles.card}>
            <input
                className={styles.toggle}
                type="checkbox"
                checked={habit.completedDates.includes(today)}
                onChange={() => onToggleToday(habit.id)}
                aria-label={`Mark ${habit.name} done today`}
            />
            <h3 className={styles.title}>{habit.name}</h3>
            <div className={styles.meta}>
                <p className={styles.stat}>Current {streak}d</p>
                <p className={styles.stat}>Longest {longestStreak}d</p>
            </div>
            <button
                className={styles.remove}
                type="button"
                onClick={() => onDeleteHabit(habit.id)}
            >
                Delete
            </button>
        </li>
    );
}

export default HabitItem;
