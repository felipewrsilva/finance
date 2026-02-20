"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "./schema";
import type { BudgetPeriod } from "@prisma/client";

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface BudgetWithSpent {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  startDate: Date;
  endDate: Date | null;
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

  // For each budget, sum its transactions in the current period
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
        startDate: b.startDate,
        endDate: b.endDate,
      };
    }),
  );

  return results;
}

export async function getBudget(id: string) {
  const user = await getUser();
  return prisma.budget.findFirst({
    where: { id, userId: user.id },
    include: { category: true },
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createBudget(formData: FormData) {
  const user = await getUser();

  const parsed = budgetSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId") || undefined,
    amount: formData.get("amount"),
    period: formData.get("period"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) return;

  await prisma.budget.create({
    data: {
      userId: user.id,
      ...parsed.data,
      amount: parsed.data.amount,
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
    amount: formData.get("amount"),
    period: formData.get("period"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) return;

  await prisma.budget.updateMany({
    where: { id, userId: user.id },
    data: { ...parsed.data },
  });

  revalidatePath("/dashboard/budgets");
  redirect("/dashboard/budgets");
}

export async function deleteBudget(id: string) {
  const user = await getUser();
  await prisma.budget.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/budgets");
}
