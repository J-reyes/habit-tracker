import { previousDayISO, toISO } from "./date.ts";

export function currentStreak(completedDates: string[]): number {
    // get the list of days completed
    const doneDays = new Set(completedDates);

    const today = toISO(new Date());
    
    // check if today is done, if it is day will be today, otherwise it will be the previous day
    let day = doneDays.has(today) ? today : previousDayISO(today);

    let streak = 0;
    while (doneDays.has(day)) {
        streak++;
        day = previousDayISO(day);
    }
    return streak;
}