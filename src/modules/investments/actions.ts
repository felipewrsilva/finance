"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { investmentSchema } from "./schema";
import { fetchTesouroDiretoRates } from "@/lib/tesouro-rates";
import type { InvestmentStatus } from "@prisma/client";

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getInvestmentCategories() {
  return prisma.investmentCategory.findMany({ orderBy: { name: "asc" } });
}

export async function getInvestments(status?: InvestmentStatus) {
  const user = await getUser();
  return prisma.investment.findMany({
    where: {
      userId: user.id,
      ...(status ? { status } : {}),
    },
    include: { category: true },
    orderBy: { startDate: "desc" },
  });
}

export async function getInvestment(id: string) {
  const user = await getUser();
  return prisma.investment.findFirst({
    where: { id, userId: user.id },
    include: { category: true },
  });
}

/**
 * Returns the last 12-month moving-average rate for a given category source key.
 * Falls back to 0 if no rate history exists.
 */
export async function getDefaultRateForCategory(categoryId: string): Promise<number> {
  const category = await prisma.investmentCategory.findUnique({
    where: { id: categoryId },
    select: { defaultRateSource: true },
  });

  if (!category?.defaultRateSource) return 0;

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);

  const history = await prisma.investmentRateHistory.findMany({
    where: {
      categoryId,
      sourceDate: { gte: cutoff },
    },
    select: { rateAnnualPercentage: true },
  });

  if (history.length === 0) return 0;

  const avg =
    history.reduce((s, h) => s + Number(h.rateAnnualPercentage), 0) / history.length;

  return Math.round(avg * 100) / 100;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createInvestment(formData: FormData) {
  const user = await getUser();

  const isRecurring = formData.get("recurring") === "true";
  const parsed = investmentSchema.safeParse({
    categoryId: formData.get("categoryId"),
    customCategoryName: formData.get("customCategoryName") || null,
    transactionId: formData.get("transactionId") || null,
    startDate: formData.get("startDate"),
    principalAmount: formData.get("principalAmount"),
    currency: formData.get("currency") || "BRL",
    annualInterestRate: formData.get("annualInterestRate"),
    recurring: String(isRecurring),
    recurrenceInterval: isRecurring ? formData.get("recurrenceInterval") : null,
    recurrenceAmount: isRecurring ? formData.get("recurrenceAmount") : null,
    compounding: formData.get("compounding") || "ANNUAL",
    status: formData.get("status") || "ACTIVE",
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return;
  }

  const { principalAmount, annualInterestRate, recurrenceAmount, ...rest } = parsed.data;

  await prisma.investment.create({
    data: {
      userId: user.id,
      principalAmount,
      annualInterestRate,
      ...(recurrenceAmount != null ? { recurrenceAmount } : {}),
      ...rest,
    },
  });

  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard/reports");
  redirect("/dashboard/investments");
}

export async function updateInvestment(id: string, formData: FormData) {
  const user = await getUser();

  const existing = await prisma.investment.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return;

  const isRecurring = formData.get("recurring") === "true";
  const parsed = investmentSchema.safeParse({
    categoryId: formData.get("categoryId"),
    customCategoryName: formData.get("customCategoryName") || null,
    transactionId: formData.get("transactionId") || null,
    startDate: formData.get("startDate"),
    principalAmount: formData.get("principalAmount"),
    currency: formData.get("currency") || "BRL",
    annualInterestRate: formData.get("annualInterestRate"),
    recurring: String(isRecurring),
    recurrenceInterval: isRecurring ? formData.get("recurrenceInterval") : null,
    recurrenceAmount: isRecurring ? formData.get("recurrenceAmount") : null,
    compounding: formData.get("compounding") || "ANNUAL",
    status: formData.get("status") || "ACTIVE",
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) return;

  const { principalAmount, annualInterestRate, recurrenceAmount, ...rest } = parsed.data;

  await prisma.investment.update({
    where: { id },
    data: {
      principalAmount,
      annualInterestRate,
      recurrenceAmount: recurrenceAmount ?? null,
      ...rest,
    },
  });

  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard/reports");
  redirect("/dashboard/investments");
}

export async function deleteInvestment(id: string) {
  const user = await getUser();
  await prisma.investment.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard/reports");
}

// ─── Rate sync ────────────────────────────────────────────────────────────────

/**
 * Fetches latest Tesouro Direto rates and stores them in investment_rate_history.
 * Safe to call multiple times (idempotent by sourceDate).
 */
export async function syncTesouroDiretoRates() {
  const entries = await fetchTesouroDiretoRates();
  if (!entries || entries.length === 0) return { synced: 0 };

  // Build category-id lookup by defaultRateSource
  const categories = await prisma.investmentCategory.findMany({
    select: { id: true, defaultRateSource: true },
  });

  const sourceToId: Record<string, string> = {};
  for (const c of categories) {
    if (c.defaultRateSource) sourceToId[c.defaultRateSource] = c.id;
  }

  let synced = 0;
  for (const entry of entries) {
    const categoryId = sourceToId[entry.source];
    if (!categoryId) continue;

    // Upsert by (categoryId, sourceDate) — skip if already exists
    const existing = await prisma.investmentRateHistory.findFirst({
      where: { categoryId, sourceDate: entry.sourceDate },
    });
    if (existing) continue;

    await prisma.investmentRateHistory.create({
      data: {
        categoryId,
        sourceDate: entry.sourceDate,
        rateAnnualPercentage: entry.rateAnnualPercentage,
      },
    });
    synced++;
  }

  return { synced };
}
