import { useState, useEffect } from "react";


export function useLocalStorage<T>(key: string, initial: T) {
    const [value, setValue] = useState<T>(() => {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) as T : initial;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, setValue]);

    return [value, setValue] as const;
}