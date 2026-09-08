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

export function longestStreak(completedDates: string[]): number {
    const doneDays = [...completedDates].sort();

    let longest = 0;
    let currentStreak = 0;

    for (let i = 0; i < doneDays.length; i++) {
        
        if (doneDays[i-1] === previousDayISO(doneDays[i])) {
            currentStreak++;
        } else {
            currentStreak = 1;
        }

        longest = Math.max(longest, currentStreak);
    }

    return longest;
}
