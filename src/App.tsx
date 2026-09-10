import type { Habit } from "./types";
import { toISO } from "./lib/date";
import { useLocalStorage } from "./hooks/useLocalStorage";

import "./App.css";
import Header from "./components/Header/Header";
import AddHabitsForm from "./components/AddHabitsForm/AddHabitsForm";
import HabitList from "./components/HabitList/HabitList";


function App() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);


  const todayISO = toISO(new Date());

  function handleAddHabits(habit: Habit) {
    setHabits((prev) => [habit, ...prev]);
  }

  function handleDeleteHabit(id: string) {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  }

  function handleToggleToday(id: string) {
    setHabits((prev) =>
      // Go through the habits
      prev.map((habit) =>
        // for the one whose id matches
        habit.id === id
          ? {
              // build a copy of it, changing only completedDates:
              ...habit,
              completedDates: habit.completedDates.includes(todayISO)
                // today is already checked off -> remove it (box remains un-check)
                ? habit.completedDates.filter((date) => date !== todayISO)
                // today is not there yet -> add it (box becomes checked)
                : [...habit.completedDates, todayISO],
            }
          // every other habit is returned unchanged
          : habit,
      ),
    );
  }


  return (
    <>
      <Header />
      <AddHabitsForm onAddHabits={handleAddHabits} />
      <HabitList
        habits={habits}
        onDeleteHabit={handleDeleteHabit}
        onToggleToday={handleToggleToday}
        today={todayISO}
      />
    </>
  );
}

export default App;
