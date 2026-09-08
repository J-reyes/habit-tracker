import type { Habit } from "../../types"
import { useState } from "react"

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
        <form onSubmit={handleSubmitHabit}>
            <input type="text" placeholder="Habit" name="name" value={habitName} onChange={(e) => setHabitName(e.target.value)} required/>
            <button type="submit">Add Habit</button>
        </form>
    )
}

export default AddHabitsForm;