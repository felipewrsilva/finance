"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "./schema";
import { TransactionType, TransactionStatus, type Frequency } from "@prisma/client";

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface TransactionFilters {
  month: number; // 1-12
  year: number;
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
  status?: TransactionStatus;
}

export async function getTransactions(filters: TransactionFilters) {
  const user = await getUser();

  const start = new Date(filters.year, filters.month - 1, 1);
  const end = new Date(filters.year, filters.month, 1);

  return prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: start, lt: end },
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.accountId ? { accountId: filters.accountId } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: { category: true, account: true },
    orderBy: { date: "desc" },
  });
}

export async function getTransaction(id: string) {
  const user = await getUser();
  return prisma.transaction.findFirst({
    where: { id, userId: user.id },
    include: { category: true, account: true },
  });
}

export async function getRecurringTransactions() {
  const user = await getUser();
  return prisma.transaction.findMany({
    where: { userId: user.id, isRecurring: true },
    include: { category: true, account: true },
    orderBy: { date: "desc" },
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

function parseRecurringFromForm(formData: FormData) {
  const isRecurring = formData.get("isRecurring") === "true";
  const frequency = isRecurring
    ? (formData.get("frequency") as Frequency | null)
    : null;
  const recurrenceEndRaw = formData.get("recurrenceEnd");
  const recurrenceEnd =
    isRecurring && recurrenceEndRaw ? new Date(recurrenceEndRaw as string) : null;
  return { isRecurring, frequency, recurrenceEnd };
}

export async function createTransaction(formData: FormData) {
  const user = await getUser();

  const rawAccountId = (formData.get("accountId") as string | null) || null;
  let resolvedAccountId = rawAccountId;

  if (!resolvedAccountId) {
    const defaultAccount = await prisma.account.findFirst({
      where: { userId: user.id, isDefault: true, isActive: true },
      select: { id: true },
    });
    if (!defaultAccount) {
      throw new Error("NO_DEFAULT_ACCOUNT");
    }
    resolvedAccountId = defaultAccount.id;
  }

  const { isRecurring, frequency, recurrenceEnd } = parseRecurringFromForm(formData);

  const parsed = transactionSchema.safeParse({
    accountId: resolvedAccountId,
    categoryId: formData.get("categoryId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    date: formData.get("date"),
    status: formData.get("status"),
    isRecurring: String(isRecurring),
    frequency,
    recurrenceEnd,
  });

  if (!parsed.success) return;

  const { accountId, type, amount, status, ...rest } = parsed.data;
  const delta = getDelta(type, amount, status);

  await prisma.$transaction([
    prisma.transaction.create({
      data: { userId: user.id, accountId, type, amount, status, ...rest },
    }),
    ...(delta !== 0
      ? [
          prisma.account.updateMany({
            where: { id: accountId, userId: user.id },
            data: { balance: { increment: delta } },
          }),
        ]
      : []),
  ]);

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  redirect("/dashboard/transactions");
}

export async function updateTransaction(id: string, formData: FormData) {
  const user = await getUser();

  const { isRecurring, frequency, recurrenceEnd } = parseRecurringFromForm(formData);

  const parsed = transactionSchema.safeParse({
    accountId: formData.get("accountId"),
    categoryId: formData.get("categoryId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description") || undefined,
    date: formData.get("date"),
    status: formData.get("status"),
    isRecurring: String(isRecurring),
    frequency,
    recurrenceEnd,
  });

  if (!parsed.success) return;

  // Fetch old transaction to reverse its balance effect
  const old = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
  if (!old) return;

  const oldDelta = getDelta(old.type, Number(old.amount), old.status);
  const newDelta = getDelta(parsed.data.type, parsed.data.amount, parsed.data.status);
  const netDelta = newDelta - oldDelta;

  const { accountId, type, amount, status, ...rest } = parsed.data;

  await prisma.$transaction([
    prisma.transaction.updateMany({
      where: { id, userId: user.id },
      data: { accountId, type, amount, status, ...rest },
    }),
    // Reverse old account delta + apply new one
    ...(old.accountId !== accountId
      ? [
          // Account changed — reverse on old account, apply on new account
          ...(oldDelta !== 0
            ? [
                prisma.account.updateMany({
                  where: { id: old.accountId, userId: user.id },
                  data: { balance: { increment: -oldDelta } },
                }),
              ]
            : []),
          ...(newDelta !== 0
            ? [
                prisma.account.updateMany({
                  where: { id: accountId, userId: user.id },
                  data: { balance: { increment: newDelta } },
                }),
              ]
            : []),
        ]
      : netDelta !== 0
      ? [
          prisma.account.updateMany({
            where: { id: accountId, userId: user.id },
            data: { balance: { increment: netDelta } },
          }),
        ]
      : []),
  ]);

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  redirect("/dashboard/transactions");
}

export async function deleteTransaction(id: string) {
  const user = await getUser();

  const tx = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
  if (!tx) return;

  const delta = getDelta(tx.type, Number(tx.amount), tx.status);

  await prisma.$transaction([
    prisma.transaction.delete({ where: { id } }),
    ...(delta !== 0
      ? [
          prisma.account.updateMany({
            where: { id: tx.accountId, userId: user.id },
            data: { balance: { increment: -delta } },
          }),
        ]
      : []),
  ]);

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
}

/**
 * Stop a recurring series — sets isRecurring=false and clears recurring fields.
 * The original transaction data is preserved; only future virtual occurrences stop.
 */
export async function cancelRecurring(id: string) {
  const user = await getUser();
  await prisma.transaction.updateMany({
    where: { id, userId: user.id },
    data: { isRecurring: false, frequency: null, recurrenceEnd: null },
  });
  revalidatePath("/dashboard/recurring");
  revalidatePath("/dashboard/transactions");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDelta(type: TransactionType, amount: number, status: TransactionStatus): number {
  if (status === "PENDING") return 0;
  if (type === "INCOME") return amount;
  if (type === "EXPENSE") return -amount;
  return 0; // TRANSFER
}
