"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { personalFeaturesDisabled } from "@/lib/personal-features";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "./schema";
import { ensureDefaultBudgetGroups } from "./default-groups";
import type { BudgetGroupType, BudgetPeriod } from "@prisma/client";
import { Prisma } from "@prisma/client";

async function getUser(): Promise<{ id: string; defaultCurrency?: string; locale?: string }> {
  return personalFeaturesDisabled();
}

// â”€â”€â”€ Queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface BudgetWithSpent {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  groupId: string | null;
  percentageOfGroup: number | null;
  startDate: Date;
  endDate: Date | null;
}

export interface BudgetGroupWithBudgets {
  id: string;
  type: BudgetGroupType;
  name: string;
  percentage: number;
  sortOrder: number;
  allocatedAmount: number;
  totalSpent: number;
  budgets: BudgetWithSpent[];
}

export async function getBudgets(month: number, year: number): Promise<BudgetWithSpent[]> {
  const user = await getUser();

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const budgets = await prisma.budget.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  const results = await Promise.all(
    budgets.map(async (b) => {
      const agg = await prisma.transaction.aggregate({
        where: {
          userId: user.id,
          ...(b.categoryId ? { categoryId: b.categoryId } : {}),
          type: "EXPENSE",
          status: "PAID",
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      });

      return {
        id: b.id,
        name: b.name,
        amount: Number(b.amount),
        spent: Number(agg._sum.amount ?? 0),
        period: b.period,
        categoryId: b.categoryId,
        categoryName: b.category?.name ?? null,
        categoryIcon: b.category?.icon ?? null,
        groupId: b.groupId,
        percentageOfGroup: b.percentageOfGroup != null ? Number(b.percentageOfGroup) : null,
        startDate: b.startDate,
        endDate: b.endDate,
      };
    })
  );

  return results;
}

export async function getBudgetGroups(
  month: number,
  year: number
): Promise<BudgetGroupWithBudgets[]> {
  const user = await getUser();
  await ensureDefaultBudgetGroups(user.id);

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const [groups, incomeAgg] = await Promise.all([
    prisma.budgetGroup.findMany({
      where: { userId: user.id },
      include: {
        budgets: {
          include: { category: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: "INCOME",
        status: "PAID",
        date: { gte: start, lt: end },
      },
      _sum: { amountInDefaultCurrency: true },
    }),
  ]);

  const monthlyIncome = Number(incomeAgg._sum.amountInDefaultCurrency ?? 0);

  const categoryIds = Array.from(
    new Set(
      groups.flatMap((g) =>
        g.budgets.map((b) => b.categoryId).filter((id): id is string => Boolean(id))
      )
    )
  );

  const spentByCategory =
    categoryIds.length === 0
      ? new Map<string, number>()
      : new Map(
          (
            await prisma.transaction.groupBy({
              by: ["categoryId"],
              where: {
                userId: user.id,
                type: "EXPENSE",
                status: "PAID",
                date: { gte: start, lt: end },
                categoryId: { in: categoryIds },
              },
              _sum: { amountInDefaultCurrency: true },
            })
          ).map((row) => [row.categoryId as string, Number(row._sum.amountInDefaultCurrency ?? 0)])
        );

  const uncategorizedSpent = await prisma.transaction.aggregate({
    where: {
      userId: user.id,
      type: "EXPENSE",
      status: "PAID",
      date: { gte: start, lt: end },
      categoryId: null,
    },
    _sum: { amountInDefaultCurrency: true },
  });

  return groups.map((group) => {
    const percentage = Number(group.percentage);
    const allocatedAmount = (monthlyIncome * percentage) / 100;

    const budgets: BudgetWithSpent[] = group.budgets.map((b) => {
      const spent = b.categoryId
        ? (spentByCategory.get(b.categoryId) ?? 0)
        : Number(uncategorizedSpent._sum.amountInDefaultCurrency ?? 0);

      return {
        id: b.id,
        name: b.name,
        amount: Number(b.amount),
        spent,
        period: b.period,
        categoryId: b.categoryId,
        categoryName: b.category?.name ?? null,
        categoryIcon: b.category?.icon ?? null,
        groupId: b.groupId,
        percentageOfGroup: b.percentageOfGroup != null ? Number(b.percentageOfGroup) : null,
        startDate: b.startDate,
        endDate: b.endDate,
      };
    });

    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    return {
      id: group.id,
      type: group.type,
      name: group.name,
      percentage,
      sortOrder: group.sortOrder,
      allocatedAmount,
      totalSpent,
      budgets,
    };
  });
}

export async function getBudget(id: string) {
  const user = await getUser();
  return prisma.budget.findFirst({
    where: { id, userId: user.id },
    include: { category: true, group: true },
  });
}

export async function listBudgetGroups() {
  const user = await getUser();
  await ensureDefaultBudgetGroups(user.id);
  return prisma.budgetGroup.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      type: true,
      name: true,
      percentage: true,
      sortOrder: true,
    },
  });
}

// â”€â”€â”€ Mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function upsertBudgetGroup(type: BudgetGroupType, percentage: number) {
  const user = await getUser();
  await ensureDefaultBudgetGroups(user.id);

  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    return { ok: false as const, error: "invalid_percentage" };
  }

  const groups = await prisma.budgetGroup.findMany({
    where: { userId: user.id },
    select: { id: true, type: true, percentage: true },
  });

  const nextSum = groups.reduce((sum, g) => {
    const value = g.type === type ? percentage : Number(g.percentage);
    return sum + value;
  }, 0);

  if (Math.abs(nextSum - 100) > 0.001) {
    return { ok: false as const, error: "sum_must_be_100", sum: nextSum };
  }

  await prisma.budgetGroup.updateMany({
    where: { userId: user.id, type },
    data: { percentage: new Prisma.Decimal(percentage) },
  });

  revalidatePath("/dashboard/budgets");
  return { ok: true as const };
}

export async function createBudget(formData: FormData) {
  const user = await getUser();

  const parsed = budgetSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId") || undefined,
    groupId: formData.get("groupId"),
    percentageOfGroup: formData.get("percentageOfGroup") || undefined,
    amount: formData.get("amount"),
    period: formData.get("period"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) return;

  const group = await prisma.budgetGroup.findFirst({
    where: { id: parsed.data.groupId, userId: user.id },
    select: { id: true },
  });
  if (!group) return;

  const { percentageOfGroup, ...rest } = parsed.data;

  await prisma.budget.create({
    data: {
      userId: user.id,
      ...rest,
      amount: rest.amount,
      percentageOfGroup:
        percentageOfGroup != null ? new Prisma.Decimal(percentageOfGroup) : null,
    },
  });

  revalidatePath("/dashboard/budgets");
  redirect("/dashboard/budgets");
}

export async function updateBudget(id: string, formData: FormData) {
  const user = await getUser();

  const parsed = budgetSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId") || undefined,
    groupId: formData.get("groupId"),
    percentageOfGroup: formData.get("percentageOfGroup") || undefined,
    amount: formData.get("amount"),
    period: formData.get("period"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) return;

  const group = await prisma.budgetGroup.findFirst({
    where: { id: parsed.data.groupId, userId: user.id },
    select: { id: true },
  });
  if (!group) return;

  const { percentageOfGroup, ...rest } = parsed.data;

  await prisma.budget.updateMany({
    where: { id, userId: user.id },
    data: {
      ...rest,
      percentageOfGroup:
        percentageOfGroup != null ? new Prisma.Decimal(percentageOfGroup) : null,
    },
  });

  revalidatePath("/dashboard/budgets");
  redirect("/dashboard/budgets");
}

export async function deleteBudget(id: string) {
  const user = await getUser();
  await prisma.budget.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/budgets");
}
