import { INTERVAL_YEAR_FRACTION } from "./constants";
import type { RecurrenceInterval } from "@prisma/client";

/**
 * Compound growth of a lump-sum principal.
 * r is annual rate as a decimal (e.g. 0.1065 for 10.65 %).
 */
export function futureValue(principal: number, annualRate: number, years: number): number {
  return principal * Math.pow(1 + annualRate, years);
}

/**
 * Future value of a series of recurring contributions.
 * Each contribution is invested at the same annual rate for the remaining period.
 *
 * FV = Σ_{n=1}^{N} contrib * (1 + r)^((T - n*δ))
 * where δ = intervalFraction (e.g. 1/12 for monthly) and T = years.
 */
export function futureValueRecurring(
  contribution: number,
  annualRate: number,
  years: number,
  interval: RecurrenceInterval
): number {
  const delta = INTERVAL_YEAR_FRACTION[interval];
  const N = Math.floor(years / delta);
  let fv = 0;
  for (let n = 1; n <= N; n++) {
    const remaining = years - n * delta;
    fv += contribution * Math.pow(1 + annualRate, Math.max(remaining, 0));
  }
  return fv;
}

/**
 * Total projected value = principal growth + recurring contribution growth.
 */
export function totalProjectedValue(
  principal: number,
  annualRate: number,
  years: number,
  contribution = 0,
  interval: RecurrenceInterval | null = null
): number {
  const principal_fv = futureValue(principal, annualRate, years);
  if (!contribution || !interval) return principal_fv;
  return principal_fv + futureValueRecurring(contribution, annualRate, years, interval);
}

export interface Milestone {
  multiple: number; // e.g. 2 = double, 5 = 5×
  years: number;    // years from start date
}

/**
 * Calculates years to reach each multiple of the initial principal.
 * Uses binary search for precision.
 */
export function calculateMilestones(
  principal: number,
  annualRate: number,
  contribution = 0,
  interval: RecurrenceInterval | null = null,
  maxYears = 50
): Milestone[] {
  const multiples = [2, 5, 10, 20];
  const milestones: Milestone[] = [];

  for (const multiple of multiples) {
    const target = principal * multiple;
    let lo = 0;
    let hi = maxYears;

    // Check if reachable
    const atMax = totalProjectedValue(principal, annualRate, maxYears, contribution, interval);
    if (atMax < target) continue;

    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      const val = totalProjectedValue(principal, annualRate, mid, contribution, interval);
      if (val < target) lo = mid;
      else hi = mid;
    }

    milestones.push({ multiple, years: Math.round((lo + hi) / 2 * 10) / 10 });
  }

  return milestones;
}

/**
 * Builds a yearly data series for a chart.
 * Returns { year, principalOnly, withContributions } for each year from 0 to maxYears.
 */
export function buildGrowthSeries(
  principal: number,
  annualRate: number,
  maxYears: number,
  contribution = 0,
  interval: RecurrenceInterval | null = null
): { year: number; principalOnly: number; total: number }[] {
  const series: { year: number; principalOnly: number; total: number }[] = [];
  for (let y = 0; y <= maxYears; y++) {
    const principalOnly = futureValue(principal, annualRate, y);
    const total = totalProjectedValue(principal, annualRate, y, contribution, interval);
    series.push({ year: y, principalOnly: Math.round(principalOnly * 100) / 100, total: Math.round(total * 100) / 100 });
  }
  return series;
}
