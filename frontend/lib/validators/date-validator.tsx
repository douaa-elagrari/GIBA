export function isValidDateRange(date1: string | Date, date2: string | Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // invalid date check
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return false;
  }

  // reject if date2 is before date1
  return d2.getTime() >= d1.getTime();
}