import type { Habit } from "../../types"

interface HabitItemProps {
    habit: Habit
    today: string
    streak: number
    onDeleteHabit: (id: string) => void
    onToggleToday: (id: string) => void
}

function HabitItem({ habit, today, streak, onDeleteHabit, onToggleToday }: HabitItemProps) {

    // Opting for inline function
    // function handleDelete() {
    //     onDeleteHabit(habit.id)
    // }
    


    return (
        <li>
            <h3>{habit.name}</h3>
            <p>{streak} days</p>
            {/* box marked checked if todays date is in the completedDates array */}
            <input type="checkbox" checked={habit.completedDates.includes(today)} onChange={() => onToggleToday(habit.id)} />
            <button onClick={() => onDeleteHabit(habit.id)}>Delete</button>
        </li>
    );
}

export default HabitItem;