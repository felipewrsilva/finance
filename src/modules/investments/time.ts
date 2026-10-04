/** Milliseconds since Unix epoch for projection age math. */
export function investmentAsOfMs(): number {
  return Date.now();
}

/** Fractional years from start date to an as-of timestamp. */
export function yearsElapsedSince(startDate: Date, asOfMs: number): number {
  return (asOfMs - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}
