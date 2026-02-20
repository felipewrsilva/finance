"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getExchangeRate } from "@/lib/exchange-rates";
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

async function resolveAmountInDefault(
  amount: number,
  currency: string,
  defaultCurrency: string
) {
  if (currency === defaultCurrency) {
    return { amountInDefaultCurrency: amount, exchangeRateUsed: 1 };
  }
  const rate = await getExchangeRate(currency, defaultCurrency);
  return {
    amountInDefaultCurrency: Math.round(amount * rate * 100) / 100,
    exchangeRateUsed: rate,
  };
}

export async function createTransaction(formData: FormData) {
  const user = await getUser();
  const defaultCurrency = user.defaultCurrency ?? "BRL";

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

  const isTransfer = formData.get("type") === "TRANSFER";
  const destAccountId = isTransfer
    ? (formData.get("destinationAccountId") as string | null)
    : null;

  const parsed = transactionSchema.safeParse({
    accountId: resolvedAccountId,
    categoryId: isTransfer ? undefined : formData.get("categoryId"),
    destinationAccountId: destAccountId ?? undefined,
    type: formData.get("type"),
    amount: formData.get("amount"),
    currency: (formData.get("currency") as string | null) || defaultCurrency,
    description: formData.get("description") || undefined,
    date: formData.get("date"),
    status: formData.get("status"),
    isRecurring: String(isRecurring),
    frequency,
    recurrenceEnd,
  });

  if (!parsed.success) return;

  const { accountId, type, amount, currency, status, categoryId, ...rest } = parsed.data;
  const delta = getDelta(type, amount, status);
  const { amountInDefaultCurrency, exchangeRateUsed } = await resolveAmountInDefault(
    amount,
    currency,
    defaultCurrency
  );

  if (type === "TRANSFER" && destAccountId) {
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: user.id,
          accountId,
          type,
          amount,
          currency,
          amountInDefaultCurrency,
          exchangeRateUsed,
          status: "PAID",
          date: rest.date,
          description: rest.description ?? null,
          metadata: { destinationAccountId: destAccountId },
        },
      }),
      prisma.account.updateMany({
        where: { id: accountId, userId: user.id },
        data: { balance: { increment: -amount } },
      }),
      prisma.account.updateMany({
        where: { id: destAccountId, userId: user.id },
        data: { balance: { increment: amount } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: user.id,
          accountId,
          type,
          amount,
          currency,
          amountInDefaultCurrency,
          exchangeRateUsed,
          status,
          ...(categoryId ? { categoryId } : {}),
          ...rest,
        },
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
  }

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  redirect("/dashboard/transactions");
}

export async function updateTransaction(id: string, formData: FormData) {
  const user = await getUser();
  const defaultCurrency = user.defaultCurrency ?? "BRL";

  const { isRecurring, frequency, recurrenceEnd } = parseRecurringFromForm(formData);

  const isTransfer = formData.get("type") === "TRANSFER";
  const newDestAccountId = isTransfer
    ? (formData.get("destinationAccountId") as string | null)
    : null;

  const parsed = transactionSchema.safeParse({
    accountId: formData.get("accountId"),
    categoryId: isTransfer ? undefined : formData.get("categoryId"),
    destinationAccountId: newDestAccountId ?? undefined,
    type: formData.get("type"),
    amount: formData.get("amount"),
    currency: (formData.get("currency") as string | null) || defaultCurrency,
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

  const { accountId, type, amount, currency, status, categoryId, ...rest } = parsed.data;
  const { amountInDefaultCurrency, exchangeRateUsed } = await resolveAmountInDefault(
    amount,
    currency,
    defaultCurrency
  );

  if (old.type === "TRANSFER" || type === "TRANSFER") {
    // Reverse old transfer balances
    const oldMeta = old.metadata as { destinationAccountId?: string } | null;
    const oldDestId = oldMeta?.destinationAccountId ?? null;
    const oldAmount = Number(old.amount);

    const balanceOps = [
      // Restore old source
      prisma.account.updateMany({
        where: { id: old.accountId, userId: user.id },
        data: { balance: { increment: oldAmount } },
      }),
      // Restore old dest (if it was a transfer)
      ...(old.type === "TRANSFER" && oldDestId
        ? [
            prisma.account.updateMany({
              where: { id: oldDestId, userId: user.id },
              data: { balance: { increment: -oldAmount } },
            }),
          ]
        : []),
      // Apply new source deduction
      prisma.account.updateMany({
        where: { id: accountId, userId: user.id },
        data: { balance: { increment: -amount } },
      }),
      // Apply new dest credit
      ...(type === "TRANSFER" && newDestAccountId
        ? [
            prisma.account.updateMany({
              where: { id: newDestAccountId, userId: user.id },
              data: { balance: { increment: amount } },
            }),
          ]
        : []),
    ];

    await prisma.$transaction([
      prisma.transaction.updateMany({
        where: { id, userId: user.id },
        data: {
          accountId,
          type,
          amount,
          currency,
          amountInDefaultCurrency,
          exchangeRateUsed,
          status: "PAID",
          date: rest.date,
          description: rest.description ?? null,
          categoryId: null,
          metadata: newDestAccountId ? { destinationAccountId: newDestAccountId } : {},
        },
      }),
      ...balanceOps,
    ]);
  } else {
    const oldDelta = getDelta(old.type, Number(old.amount), old.status);
    const newDelta = getDelta(type, amount, status);
    const netDelta = newDelta - oldDelta;

    await prisma.$transaction([
      prisma.transaction.updateMany({
        where: { id, userId: user.id },
        data: {
          accountId,
          type,
          amount,
          currency,
          amountInDefaultCurrency,
          exchangeRateUsed,
          status,
          ...(categoryId ? { categoryId } : {}),
          ...rest,
        },
      }),
      ...(old.accountId !== accountId
        ? [
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
  }

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
  redirect("/dashboard/transactions");
}

export async function deleteTransaction(id: string) {
  const user = await getUser();

  const tx = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
  if (!tx) return;

  const delta = getDelta(tx.type, Number(tx.amount), tx.status);

  if (tx.type === "TRANSFER") {
    const meta = tx.metadata as { destinationAccountId?: string } | null;
    const destId = meta?.destinationAccountId ?? null;
    await prisma.$transaction([
      prisma.transaction.delete({ where: { id } }),
      prisma.account.updateMany({
        where: { id: tx.accountId, userId: user.id },
        data: { balance: { increment: Number(tx.amount) } },
      }),
      ...(destId
        ? [
            prisma.account.updateMany({
              where: { id: destId, userId: user.id },
              data: { balance: { increment: -Number(tx.amount) } },
            }),
          ]
        : []),
    ]);
  } else {
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
  }

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

export async function markTransactionPaid(id: string) {
  const user = await getUser();
  const tx = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
  if (!tx || tx.status === "PAID") return;

  const delta = getDelta(tx.type, Number(tx.amount), "PAID");

  await prisma.$transaction([
    prisma.transaction.updateMany({
      where: { id, userId: user.id },
      data: { status: "PAID" },
    }),
    ...(delta !== 0
      ? [
          prisma.account.updateMany({
            where: { id: tx.accountId, userId: user.id },
            data: { balance: { increment: delta } },
          }),
        ]
      : []),
  ]);

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDelta(type: TransactionType, amount: number, status: TransactionStatus): number {
  if (status === "PENDING") return 0;
  if (type === "INCOME") return amount;
  if (type === "EXPENSE") return -amount;
  return 0; // TRANSFER
}
