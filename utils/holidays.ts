export function getHoliday(date: Date | string): string | null {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-12
    const day = d.getDate();

    // Fixed Holidays
    if (month === 1 && day === 1) return "Neujahr";
    if (month === 5 && day === 1) return "Tag der Arbeit";
    if (month === 10 && day === 3) return "Tag der Deutschen Einheit";
    if (month === 12 && day === 25) return "1. Weihnachtstag";
    if (month === 12 && day === 26) return "2. Weihnachtstag";
    if (month === 11 && day === 1) return "Allerheiligen"; // Optional depending on state, but good to have

    // Variable Holidays (Easter based)
    const easter = getEasterDate(year);
    if (!easter) return null;

    // Helper to check difference in days
    const checkDiff = (offset: number) => {
        const target = new Date(easter.getTime());
        target.setDate(easter.getDate() + offset);
        return target.getDate() === day && (target.getMonth() + 1) === month;
    };

    if (checkDiff(-2)) return "Karfreitag";
    if (checkDiff(1)) return "Ostermontag";
    if (checkDiff(39)) return "Christi Himmelfahrt";
    if (checkDiff(50)) return "Pfingstmontag";
    if (checkDiff(60)) return "Fronleichnam"; // Optional

    return null;
}

// Gaussian Easter Algorithm
function getEasterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month - 1, day);
}
