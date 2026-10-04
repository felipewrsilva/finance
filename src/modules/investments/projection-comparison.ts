"use server";

import { personalFeaturesDisabled } from "@/lib/personal-features";
import { prisma } from "@/lib/prisma";
import { detectOptionalSpending } from "@/modules/budgets/detect-optional-spending";
import { INTERVAL_YEAR_FRACTION } from "./constants";
import { totalProjectedValue } from "./projections";
import type { RecurrenceInterval } from "@prisma/client";

const HORIZONS = [5, 10, 20] as const;
const DEFAULT_ANNUAL_RATE = 0.10; // 10% fallback when no investments exist

export type ProjectionHorizon = (typeof HORIZONS)[number];

export interface HorizonProjection {
  years: ProjectionHorizon;
  current: number;
  optimized: number;
  delta: number;
}

export interface ProjectionComparison {
  horizons: HorizonProjection[];
  currentMonthlyContribution: number;
  optimizedMonthlyContribution: number;
  redirectedMonthlyTotal: number;
  blendedAnnualRate: number;
  totalPrincipal: number;
  activeInvestmentCount: number;
}

function toMonthlyContribution(
  amount: number,
  interval: RecurrenceInterval | null
): number {
  if (!amount || !interval) return 0;
  const yearFraction = INTERVAL_YEAR_FRACTION[interval];
  return amount * (1 / (yearFraction * 12));
}

async function getUserId(): Promise<string> {
  return personalFeaturesDisabled();
}

/**
 * Side-by-side current vs optimized investment projections.
 * Optimized adds redirectable optional spending as extra monthly contributions.
 */
export async function getProjectionComparison(): Promise<ProjectionComparison | null> {
  const userId = await getUserId();

  const [investments, optional] = await Promise.all([
    prisma.investment.findMany({
      where: { userId, status: "ACTIVE" },
    }),
    detectOptionalSpending(),
  ]);

  const redirectedMonthlyTotal = optional.totalRedirectable;
  const hasInvestments = investments.length > 0;
  const hasRedirect = redirectedMonthlyTotal > 0;

  if (!hasInvestments && !hasRedirect) {
    return null;
  }

  let totalPrincipal = 0;
  let currentMonthlyContribution = 0;
  let weightedRate = 0;

  for (const inv of investments) {
    const principal = Number(inv.principalAmount);
    const rate = Number(inv.annualInterestRate) / 100;
    const contrib = inv.recurrenceAmount ? Number(inv.recurrenceAmount) : 0;
    totalPrincipal += principal;
    currentMonthlyContribution += toMonthlyContribution(
      contrib,
      inv.recurrenceInterval
    );
    weightedRate += rate * principal;
  }

  const blendedAnnualRate =
    totalPrincipal > 0 ? weightedRate / totalPrincipal : DEFAULT_ANNUAL_RATE;

  const optimizedMonthlyContribution =
    currentMonthlyContribution + redirectedMonthlyTotal;

  const projectPortfolio = (extraMonthly: number, years: number): number => {
    if (hasInvestments) {
      let total = 0;
      for (const inv of investments) {
        const principal = Number(inv.principalAmount);
        const rate = Number(inv.annualInterestRate) / 100;
        const contrib = inv.recurrenceAmount ? Number(inv.recurrenceAmount) : 0;
        const interval = inv.recurrenceInterval;
        const monthlyBase = toMonthlyContribution(contrib, interval);
        const share =
          totalPrincipal > 0 ? principal / totalPrincipal : 1 / investments.length;
        const monthly = monthlyBase + extraMonthly * share;
        total += totalProjectedValue(principal, rate, years, monthly, "MONTHLY");
      }
      return total;
    }

    // No investments yet: project redirect-only (or zero) at default rate.
    const monthly = currentMonthlyContribution + extraMonthly;
    return totalProjectedValue(0, blendedAnnualRate, years, monthly, "MONTHLY");
  };

  const horizons: HorizonProjection[] = HORIZONS.map((years) => {
    const current = projectPortfolio(0, years);
    const optimized = projectPortfolio(redirectedMonthlyTotal, years);
    return {
      years,
      current,
      optimized,
      delta: optimized - current,
    };
  });

  return {
    horizons,
    currentMonthlyContribution,
    optimizedMonthlyContribution,
    redirectedMonthlyTotal,
    blendedAnnualRate,
    totalPrincipal,
    activeInvestmentCount: investments.length,
  };
}
