"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recurringSchema } from "./schema";
import type { TransactionType, Frequency, TransactionStatus } from "@prisma/client";

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export interface RecurringRuleView {
  id: string;
  frequency: Frequency;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  templateData: {
    accountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    description?: string;
  };
  categoryName: string | null;
  categoryIcon: string | null;
  accountName: string | null;
}

export async function getRecurringRules(): Promise<RecurringRuleView[]> {
  const user = await getUser();

  const rules = await prisma.recurringRule.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Enrich with category and account names
  const accountIds = [...new Set(rules.map((r) => (r.templateData as { accountId: string }).accountId))];
  const categoryIds = [...new Set(rules.map((r) => (r.templateData as { categoryId: string }).categoryId))];

  const [accounts, categories] = await Promise.all([
    prisma.account.findMany({ where: { id: { in: accountIds }, userId: user.id } }),
    prisma.category.findMany({ where: { id: { in: categoryIds } } }),
  ]);

  const accMap = new Map(accounts.map((a) => [a.id, a]));
  const catMap = new Map(categories.map((c) => [c.id, c]));

  return rules.map((r) => {
    const td = r.templateData as {
      accountId: string;
      categoryId: string;
      type: TransactionType;
      amount: number;
      description?: string;
    };
    const cat = catMap.get(td.categoryId);
    const acc = accMap.get(td.accountId);

    return {
      id: r.id,
      frequency: r.frequency,
      startDate: r.startDate,
      endDate: r.endDate,
      isActive: r.isActive,
      templateData: td,
      categoryName: cat?.name ?? null,
      categoryIcon: cat?.icon ?? null,
      accountName: acc?.name ?? null,
    };
  });
}

export async function getRecurringRule(id: string) {
  const user = await getUser();
  return prisma.recurringRule.findFirst({ where: { id, userId: user.id } });
}

export async function createRecurringRule(formData: FormData) {
  const user = await getUser();

  const parsed = recurringSchema.safeParse({
    categoryId: formData.get("categoryId"),
    accountId: formData.get("accountId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    frequency: formData.get("frequency"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) return;

  const { accountId, categoryId, type, amount, description, frequency, startDate, endDate } =
    parsed.data;

  await prisma.recurringRule.create({
    data: {
      userId: user.id,
      frequency,
      startDate,
      endDate: endDate ?? null,
      isActive: true,
      templateData: { accountId, categoryId, type, amount, description },
    },
  });

  revalidatePath("/dashboard/recurring");
  redirect("/dashboard/recurring");
}

export async function updateRecurringRule(id: string, formData: FormData) {
  const user = await getUser();

  const parsed = recurringSchema.safeParse({
    categoryId: formData.get("categoryId"),
    accountId: formData.get("accountId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    frequency: formData.get("frequency"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) return;

  const { accountId, categoryId, type, amount, description, frequency, startDate, endDate } =
    parsed.data;

  await prisma.recurringRule.updateMany({
    where: { id, userId: user.id },
    data: {
      frequency,
      startDate,
      endDate: endDate ?? null,
      templateData: { accountId, categoryId, type, amount, description },
    },
  });

  revalidatePath("/dashboard/recurring");
  redirect("/dashboard/recurring");
}

export async function toggleRecurringRule(id: string, isActive: boolean) {
  const user = await getUser();
  await prisma.recurringRule.updateMany({
    where: { id, userId: user.id },
    data: { isActive },
  });
  revalidatePath("/dashboard/recurring");
}

export async function deleteRecurringRule(id: string) {
  const user = await getUser();
  await prisma.recurringRule.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/recurring");
}

/**
 * For each active rule, generate a PENDING transaction for the current month
 * if one doesn't already exist.
 */
export async function generateRecurringTransactions(month: number, year: number) {
  const user = await getUser();

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const rules = await prisma.recurringRule.findMany({
    where: { userId: user.id, isActive: true, startDate: { lte: end } },
  });

  let generated = 0;

  for (const rule of rules) {
    if (rule.endDate && rule.endDate < start) continue;

    const td = rule.templateData as {
      accountId: string;
      categoryId: string;
      type: TransactionType;
      amount: number;
      description?: string;
    };

    // Check if transaction for this rule already exists this period
    const existing = await prisma.transaction.findFirst({
      where: {
        userId: user.id,
        recurringRuleId: rule.id,
        date: { gte: start, lt: end },
      },
    });

    if (existing) continue;

    // Create PENDING transaction on the 1st of the month
    const dueDate = new Date(year, month - 1, rule.startDate.getDate());

    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: td.accountId,
        categoryId: td.categoryId,
        type: td.type,
        amount: td.amount,
        description: td.description ?? null,
        date: dueDate,
        status: "PENDING" as TransactionStatus,
        recurringRuleId: rule.id,
      },
    });
    generated++;
  }

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  return generated;
}
