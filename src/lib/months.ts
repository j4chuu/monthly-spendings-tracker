export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function getMonthLabel(month: number): string {
  return MONTH_NAMES[month - 1] ?? "";
}

export function getYearOptions(currentYear: number): number[] {
  const years: number[] = [];
  for (let year = currentYear - 3; year <= currentYear + 1; year += 1) {
    years.push(year);
  }
  return years;
}
