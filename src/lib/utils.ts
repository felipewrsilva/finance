import type { Frequency } from "@prisma/client";

// ─── Date ────────────────────────────────────────────────────────────────────

/**
 * Formats a date using Intl.DateTimeFormat and normalises capitalisation so
 * that only the very first character is uppercased.  This prevents locale
 * quirks like "Fevereiro De 2026" (pt-BR) and instead produces
 * "Fevereiro de 2026".
 */
export function formatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  const s = new Intl.DateTimeFormat(locale, options).format(date);
  const lower = s.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// ─── Currency ────────────────────────────────────────────────────────────────

const _currencyFormatterCache = new Map<string, Intl.NumberFormat>();

export function formatCurrency(
  amount: number,
  currency = "BRL",
  locale = "pt-BR"
): string {
  const key = `${locale}:${currency}`;
  let formatter = _currencyFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
    _currencyFormatterCache.set(key, formatter);
  }
  return formatter.format(amount);
}

// ─── Selectors ───────────────────────────────────────────────────────────────

/**
 * Returns true only when there are multiple options — avoids rendering
 * pointless single-item dropdowns scattered throughout the UI.
 */
export function shouldRenderSelector<T>(items: T[]): boolean {
  return items.length > 1;
}

// ─── Recurring ───────────────────────────────────────────────────────────────

/**
 * Given a recurring transaction's start date and frequency, return the next
 * occurrence date after `after` (defaults to today).
 * Returns null if the series has ended.
 */
export function getNextOccurrenceDate(
  startDate: Date,
  frequency: Frequency,
  recurrenceEnd: Date | null,
  after: Date = new Date()
): Date | null {
  let candidate = new Date(startDate);

  while (candidate <= after) {
    candidate = addFrequency(candidate, frequency);
  }

  if (recurrenceEnd && candidate > recurrenceEnd) return null;
  return candidate;
}

/**
 * Generate all occurrence dates for a recurring transaction within [from, to].
 */
export function getOccurrencesInRange(
  startDate: Date,
  frequency: Frequency,
  recurrenceEnd: Date | null,
  from: Date,
  to: Date
): Date[] {
  const dates: Date[] = [];
  let current = new Date(startDate);

  // If start is within range, include it
  if (current >= from && current <= to) {
    dates.push(new Date(current));
  }

  // Advance past start date if needed
  while (current < from) {
    current = addFrequency(current, frequency);
    if (recurrenceEnd && current > recurrenceEnd) break;
    if (current >= from && current <= to) {
      dates.push(new Date(current));
    }
  }

  // Continue generating within range
  if (current >= from) {
    let next = addFrequency(current, frequency);
    while (next <= to) {
      if (recurrenceEnd && next > recurrenceEnd) break;
      dates.push(new Date(next));
      next = addFrequency(next, frequency);
    }
  }

  return dates;
}

export function addFrequency(date: Date, frequency: Frequency): Date {
  const d = new Date(date);
  switch (frequency) {
    case "DAILY":
      d.setDate(d.getDate() + 1);
      break;
    case "WEEKLY":
      d.setDate(d.getDate() + 7);
      break;
    case "MONTHLY":
      d.setMonth(d.getMonth() + 1);
      break;
    case "YEARLY":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d;
}
