"use server";

import { personalFeaturesDisabled } from "@/lib/personal-features";
import { prisma } from "@/lib/prisma";
import { detectOptionalSpending } from "@/modules/budgets/detect-optional-spending";
import { ensureDefaultBudgetGroups } from "@/modules/budgets/default-groups";
import { totalProjectedValue } from "./projections";

export type RecommendationPriority = 1 | 2 | 3 | 4 | 5;

export interface Recommendation {
  id: string;
  priority: RecommendationPriority;
  titleKey: string;
  descriptionKey: string;
  params: Record<string, string | number>;
}

async function getUserId(): Promise<string> {
  return personalFeaturesDisabled();
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
}

/**
 * Prioritized investment recommendations (max 3).
 */
export async function getRecommendations(): Promise<Recommendation[]> {
  const userId = await getUserId();
  await ensureDefaultBudgetGroups(userId);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const [optional, investments, incomeAgg, investGroup, priorOptionalTx] =
    await Promise.all([
      detectOptionalSpending(now),
      prisma.investment.findMany({
        where: { userId, status: "ACTIVE" },
        select: {
          id: true,
          recurring: true,
          recurrenceAmount: true,
          principalAmount: true,
          annualInterestRate: true,
        },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          status: "PAID",
          date: { gte: monthStart, lt: nextMonth },
        },
        _sum: { amountInDefaultCurrency: true },
      }),
      prisma.budgetGroup.findFirst({
        where: { userId, type: "INVESTMENTS" },
        select: { percentage: true },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          status: "PAID",
          date: { gte: sixMonthsAgo, lt: nextMonth },
          category: { isEssential: false },
        },
        select: { amountInDefaultCurrency: true, date: true },
      }),
    ]);

  const monthlyIncome = Number(incomeAgg._sum.amountInDefaultCurrency ?? 0);
  const optionalPctOfIncome =
    monthlyIncome > 0 ? (optional.totalMonthlyAverage / monthlyIncome) * 100 : 0;

  const hasInvestments = investments.length > 0;
  const hasRecurringContrib = investments.some(
    (inv) => inv.recurring && inv.recurrenceAmount && Number(inv.recurrenceAmount) > 0
  );
  const highOptional = optional.totalRedirectable > 0 && optionalPctOfIncome >= 10;
  const investGroupPct = investGroup ? Number(investGroup.percentage) : 0;

  // 3-month trend: compare avg of last 3 months vs prior 3 months
  const recent = new Map<string, number>();
  const prior = new Map<string, number>();
  for (const tx of priorOptionalTx) {
    const key = monthKey(tx.date);
    const amount = Number(tx.amountInDefaultCurrency);
    if (tx.date >= threeMonthsAgo) {
      recent.set(key, (recent.get(key) ?? 0) + amount);
    } else {
      prior.set(key, (prior.get(key) ?? 0) + amount);
    }
  }
  const avg = (m: Map<string, number>) => {
    if (m.size === 0) return 0;
    let sum = 0;
    for (const v of m.values()) sum += v;
    return sum / m.size;
  };
  const recentAvg = avg(recent);
  const priorAvg = avg(prior);
  const optionalDecreased =
    priorAvg > 0 && recentAvg > 0 && recentAvg <= priorAvg * 0.9;

  const boost10y = totalProjectedValue(
    0,
    0.1,
    10,
    optional.totalRedirectable,
    "MONTHLY"
  );

  const candidates: Recommendation[] = [];

  if (highOptional && !hasInvestments) {
    candidates.push({
      id: "start-investing-from-optional",
      priority: 1,
      titleKey: "startInvestingTitle",
      descriptionKey: "startInvestingBody",
      params: {
        redirectable: Math.round(optional.totalRedirectable),
        boost10y: Math.round(boost10y),
        optionalPct: Math.round(optionalPctOfIncome),
      },
    });
  }

  if (hasInvestments && !hasRecurringContrib) {
    candidates.push({
      id: "add-recurring-contributions",
      priority: 2,
      titleKey: "addRecurringTitle",
      descriptionKey: "addRecurringBody",
      params: {
        investmentCount: investments.length,
      },
    });
  }

  if (highOptional && hasInvestments) {
    candidates.push({
      id: "redirect-optional-to-investments",
      priority: 3,
      titleKey: "redirectOptionalTitle",
      descriptionKey: "redirectOptionalBody",
      params: {
        redirectable: Math.round(optional.totalRedirectable),
        boost10y: Math.round(boost10y),
      },
    });
  }

  if (investGroupPct === 0) {
    candidates.push({
      id: "raise-investment-budget-group",
      priority: 4,
      titleKey: "raiseInvestGroupTitle",
      descriptionKey: "raiseInvestGroupBody",
      params: {},
    });
  }

  if (optionalDecreased) {
    candidates.push({
      id: "celebrate-optional-decrease",
      priority: 5,
      titleKey: "celebrateDecreaseTitle",
      descriptionKey: "celebrateDecreaseBody",
      params: {
        priorAvg: Math.round(priorAvg),
        recentAvg: Math.round(recentAvg),
      },
    });
  }

  const seen = new Set<string>();
  return candidates
    .sort((a, b) => a.priority - b.priority)
    .filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    })
    .slice(0, 3);
}
