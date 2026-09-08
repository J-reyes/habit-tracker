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