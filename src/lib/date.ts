/**
 * Convert a date to a ISO string
 * @param date - The date to convert
 * @returns The ISO string
 * sv-SE format is YYYY-MM-DD
 */

export function toISO(date: Date): string {
    const formatted = new Intl.DateTimeFormat('sv-SE', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date)

    return formatted
}

// pass in a date string in ISO format and get the previous day in ISO format
export function previousDayISO(date: string): string {
    const previousDay = new Date(date + 'T00:00:00');
    previousDay.setDate(previousDay.getDate() - 1);
    return toISO(previousDay);
}

export function lastNDaysISO(n: number, today: string): string[] {
    let date = today;
    const days: string[] = [];

    for (let i = 0; i < n; i++) {
        days.push(date);
        date = previousDayISO(date);
    }

    return days.reverse();
}

export function monthGridISO(today: string): (string | null)[] {
    const date = new Date(today + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth();

    // returns the first day of the month as a number 0-6 (0 is sunday, 6 is saturday)
    const leadingBlankDays = new Date(year, month, 1).getDay();
    // day 0 of the *next* month is the last day of *this* month,
    // so .getDate() on it is this month's length. example:
    // 2026, 8 +1, 0 -> day 0 of october -> sep 30 -> 30
    // 2026, 9 +1, 0 -> day 0 of november -> oct 31 -> 31
    const daysInMonth = new Date(year, month +1, 0).getDate();

    // create an array of nulls that is the blank days from sunday to the first day of the month
    // then add the days of the month to the array
    const totalDays: (string | null)[] = Array(leadingBlankDays).fill(null);

    for (let i = 1; i <= daysInMonth; i++) {    
        // add the dates to the array
        totalDays.push(toISO(new Date(year, month, i)));
    }

    return totalDays;
    
}

export function weekdayInitials(): string[] {
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
}