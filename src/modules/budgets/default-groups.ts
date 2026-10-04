import { Prisma, type BudgetGroupType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const DEFAULT_BUDGET_GROUPS: ReadonlyArray<{
  type: BudgetGroupType;
  name: string;
  percentage: number;
  sortOrder: number;
}> = [
  { type: "FIXED_COSTS", name: "Fixed costs", percentage: 50, sortOrder: 0 },
  { type: "COMFORT", name: "Comfort", percentage: 30, sortOrder: 1 },
  { type: "GOALS", name: "Goals", percentage: 10, sortOrder: 2 },
  { type: "INVESTMENTS", name: "Investments", percentage: 10, sortOrder: 3 },
];

/**
 * Idempotently create the 50/30/10/10 default budget groups for a user.
 * Returns the FIXED_COSTS group id (for assigning legacy budgets).
 */
export async function ensureDefaultBudgetGroups(userId: string): Promise<string> {
  const existing = await prisma.budgetGroup.findMany({
    where: { userId },
    select: { id: true, type: true },
  });

  if (existing.length === 0) {
    await prisma.budgetGroup.createMany({
      data: DEFAULT_BUDGET_GROUPS.map((g) => ({
        userId,
        type: g.type,
        name: g.name,
        percentage: new Prisma.Decimal(g.percentage),
        sortOrder: g.sortOrder,
      })),
    });
  } else {
    const have = new Set(existing.map((g) => g.type));
    const missing = DEFAULT_BUDGET_GROUPS.filter((g) => !have.has(g.type));
    if (missing.length > 0) {
      await prisma.budgetGroup.createMany({
        data: missing.map((g) => ({
          userId,
          type: g.type,
          name: g.name,
          percentage: new Prisma.Decimal(g.percentage),
          sortOrder: g.sortOrder,
        })),
        skipDuplicates: true,
      });
    }
  }

  const fixed = await prisma.budgetGroup.findFirst({
    where: { userId, type: "FIXED_COSTS" },
    select: { id: true },
  });

  if (!fixed) {
    throw new Error(`FIXED_COSTS group missing for user ${userId}`);
  }

  return fixed.id;
}
