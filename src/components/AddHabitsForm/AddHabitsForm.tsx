import type { Habit } from "../../types"
import { useState } from "react"
import styles from "./AddHabitsForm.module.css"

interface AddHabitsFormProps {

    onAddHabits: (habit: Habit) => void
}
function AddHabitsForm({ onAddHabits }: AddHabitsFormProps) {
    const [habitName, setHabitName] = useState<string>("")

    function handleSubmitHabit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        if (habitName.trim() === "") return
        const newHabit: Habit = { id: crypto.randomUUID(), name: habitName, completedDates: [] }
        onAddHabits(newHabit)
        setHabitName("")
    }

    
    return (
        <form className={styles.form} onSubmit={handleSubmitHabit}>
            <input
                className={styles.input}
                type="text"
                placeholder="Name a habit to start a streak"
                name="name"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                required
                aria-label="Habit name"
            />
            <button className={styles.submit} type="submit">
                Add habit
            </button>
        </form>
    )
}

export default AddHabitsForm;