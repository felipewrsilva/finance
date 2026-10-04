"use server";

import { personalFeaturesDisabled } from "@/lib/personal-features";
import { prisma } from "@/lib/prisma";

export type OptionalSpendingConfidence = "low" | "medium" | "high";

export interface OptionalSpendingItem {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  monthlyAverage: number;
  redirectableAmount: number;
  confidence: OptionalSpendingConfidence;
  monthsWithSpend: number;
  isRecurring: boolean;
}

export interface OptionalSpendingResult {
  items: OptionalSpendingItem[];
  totalMonthlyAverage: number;
  totalRedirectable: number;
  monthsAnalyzed: number;
}

async function getUserId(): Promise<string> {
  return personalFeaturesDisabled();
}

function confidenceFor(monthsWithSpend: number, isRecurring: boolean): OptionalSpendingConfidence {
  if (isRecurring || monthsWithSpend >= 5) return "high";
  if (monthsWithSpend >= 3) return "medium";
  return "low";
}

/**
 * Detect optional (non-essential) spending that could be redirected to investments.
 * Uses the last 6 calendar months of paid expenses in the user's default currency.
 */
export async function detectOptionalSpending(
  asOf: Date = new Date()
): Promise<OptionalSpendingResult> {
  const userId = await getUserId();

  const end = new Date(asOf.getFullYear(), asOf.getMonth() + 1, 1);
  const start = new Date(end.getFullYear(), end.getMonth() - 6, 1);
  const monthsAnalyzed = 6;

  const optionalCategories = await prisma.category.findMany({
    where: {
      isEssential: false,
      type: "EXPENSE",
      OR: [{ userId: null }, { userId }],
    },
    select: { id: true, name: true, icon: true },
  });

  if (optionalCategories.length === 0) {
    return {
      items: [],
      totalMonthlyAverage: 0,
      totalRedirectable: 0,
      monthsAnalyzed,
    };
  }

  const categoryIds = optionalCategories.map((c) => c.id);
  const categoryById = new Map(optionalCategories.map((c) => [c.id, c]));

  const [transactions, recurringRules] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        status: "PAID",
        categoryId: { in: categoryIds },
        date: { gte: start, lt: end },
      },
      select: {
        categoryId: true,
        amountInDefaultCurrency: true,
        date: true,
      },
    }),
    prisma.recurringRule.findMany({
      where: {
        userId,
        isActive: true,
        type: "EXPENSE",
        categoryId: { in: categoryIds },
      },
      select: { categoryId: true },
    }),
  ]);

  if (transactions.length === 0) {
    return {
      items: [],
      totalMonthlyAverage: 0,
      totalRedirectable: 0,
      monthsAnalyzed,
    };
  }

  const recurringCategoryIds = new Set(
    recurringRules.map((r) => r.categoryId).filter((id): id is string => Boolean(id))
  );

  type Acc = { total: number; months: Set<string> };
  const byCategory = new Map<string, Acc>();

  for (const tx of transactions) {
    if (!tx.categoryId) continue;
    const key = `${tx.date.getUTCFullYear()}-${tx.date.getUTCMonth()}`;
    const acc = byCategory.get(tx.categoryId) ?? { total: 0, months: new Set<string>() };
    acc.total += Number(tx.amountInDefaultCurrency);
    acc.months.add(key);
    byCategory.set(tx.categoryId, acc);
  }

  const items: OptionalSpendingItem[] = [];

  for (const [categoryId, acc] of byCategory) {
    const category = categoryById.get(categoryId);
    if (!category) continue;

    const monthlyAverage = acc.total / monthsAnalyzed;
    const isRecurring = recurringCategoryIds.has(categoryId);
    // Recurring optional spend is fully redirectable; one-off lean toward 70%.
    const redirectableAmount = isRecurring ? monthlyAverage : monthlyAverage * 0.7;
    const monthsWithSpend = acc.months.size;

    items.push({
      categoryId,
      categoryName: category.name,
      categoryIcon: category.icon,
      monthlyAverage,
      redirectableAmount,
      confidence: confidenceFor(monthsWithSpend, isRecurring),
      monthsWithSpend,
      isRecurring,
    });
  }

  items.sort((a, b) => b.redirectableAmount - a.redirectableAmount);

  const totalMonthlyAverage = items.reduce((s, i) => s + i.monthlyAverage, 0);
  const totalRedirectable = items.reduce((s, i) => s + i.redirectableAmount, 0);

  return {
    items,
    totalMonthlyAverage,
    totalRedirectable,
    monthsAnalyzed,
  };
}
