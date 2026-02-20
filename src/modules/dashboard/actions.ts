"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TransactionType, TransactionStatus } from "@prisma/client";

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export interface MonthlySummary {
  income: number;
  expense: number;
  net: number;
  pendingIncome: number;
  pendingExpense: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  total: number;
  type: TransactionType;
}

export interface RecentTransaction {
  id: string;
  description: string | null;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  date: Date;
  categoryName: string | null;
  categoryIcon: string | null;
  accountName: string;
}

export async function getDashboardSummary(month: number, year: number) {
  const user = await getUser();

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const [incomeAgg, expenseAgg, pendingIncomeAgg, pendingExpenseAgg, recent, categoryRaw] =
    await Promise.all([
      // Paid income
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: TransactionType.INCOME,
          status: TransactionStatus.PAID,
          date: { gte: start, lt: end },
        },
        _sum: { amountInDefaultCurrency: true },
      }),
      // Paid expense
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: TransactionType.EXPENSE,
          status: TransactionStatus.PAID,
          date: { gte: start, lt: end },
        },
        _sum: { amountInDefaultCurrency: true },
      }),
      // Pending income
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: TransactionType.INCOME,
          status: TransactionStatus.PENDING,
          date: { gte: start, lt: end },
        },
        _sum: { amountInDefaultCurrency: true },
      }),
      // Pending expense
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: TransactionType.EXPENSE,
          status: TransactionStatus.PENDING,
          date: { gte: start, lt: end },
        },
        _sum: { amountInDefaultCurrency: true },
      }),
      // Recent 5 transactions
      prisma.transaction.findMany({
        where: { userId: user.id, date: { gte: start, lt: end } },
        include: { category: true, account: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
      // Category breakdown for expenses
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId: user.id,
          type: TransactionType.EXPENSE,
          status: TransactionStatus.PAID,
          date: { gte: start, lt: end },
        },
        _sum: { amountInDefaultCurrency: true },
        orderBy: { _sum: { amountInDefaultCurrency: "desc" } },
        take: 6,
      }),
    ]);

  // Enrich category breakdown with names
  const categoryIds = categoryRaw.map((c) => c.categoryId).filter(Boolean) as string[];
  const categories = categoryIds.length
    ? await prisma.category.findMany({ where: { id: { in: categoryIds } } })
    : [];

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const categoryBreakdown: CategoryBreakdownItem[] = categoryRaw.map((c) => {
    const cat = c.categoryId ? categoryMap.get(c.categoryId) : undefined;
    return {
      categoryId: c.categoryId ?? "uncategorized",
      categoryName: cat?.name ?? "Uncategorized",
      categoryIcon: cat?.icon ?? null,
      total: Number(c._sum.amountInDefaultCurrency ?? 0),
      type: TransactionType.EXPENSE,
    };
  });

  const summary: MonthlySummary = {
    income: Number(incomeAgg._sum.amountInDefaultCurrency ?? 0),
    expense: Number(expenseAgg._sum.amountInDefaultCurrency ?? 0),
    net: Number(incomeAgg._sum.amountInDefaultCurrency ?? 0) - Number(expenseAgg._sum.amountInDefaultCurrency ?? 0),
    pendingIncome: Number(pendingIncomeAgg._sum.amountInDefaultCurrency ?? 0),
    pendingExpense: Number(pendingExpenseAgg._sum.amountInDefaultCurrency ?? 0),
  };

  const recentTransactions: RecentTransaction[] = recent.map((t) => ({
    id: t.id,
    description: t.description,
    amount: Number(t.amount),
    type: t.type,
    status: t.status,
    date: t.date,
    categoryName: t.category?.name ?? null,
    categoryIcon: t.category?.icon ?? null,
    accountName: t.account.name,
  }));

  return { summary, recentTransactions, categoryBreakdown };
}

/** Get monthly income/expense for the last N months (for reports chart) */
export async function getMonthlyReport(months = 6) {
  const user = await getUser();

  const now = new Date();
  const results = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);

    const [inc, exp] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: TransactionType.INCOME,
          status: TransactionStatus.PAID,
          date: { gte: start, lt: end },
        },
        _sum: { amountInDefaultCurrency: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: TransactionType.EXPENSE,
          status: TransactionStatus.PAID,
          date: { gte: start, lt: end },
        },
        _sum: { amountInDefaultCurrency: true },
      }),
    ]);

    results.push({
      month: start.toLocaleString("default", { month: "short" }),
      year: start.getFullYear(),
      income: Number(inc._sum.amountInDefaultCurrency ?? 0),
      expense: Number(exp._sum.amountInDefaultCurrency ?? 0),
    });
  }

  return results;
}
