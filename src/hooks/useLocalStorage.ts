import { useState, useEffect } from "react";


export function useLocalStorage<T>(key: string, initial: T) {
    const [habits, setHabits] = useState<T>(() => {
        const storedHabits = localStorage.getItem(key);
        return storedHabits ? JSON.parse(storedHabits) as T : initial;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(habits));
    }, [habits, setHabits]);

    return [habits, setHabits] as const;
}