"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface UserCurrencyPreferences {
  defaultCurrency: string;
  locale: string;
  /** All enabled currencies, always includes defaultCurrency as first entry. */
  currencies: string[];
}

export async function getUserCurrencies(): Promise<UserCurrencyPreferences> {
  const user = await getUser();

  const [dbUser, userCurrencies] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { defaultCurrency: true, locale: true },
    }),
    prisma.userCurrency.findMany({
      where: { userId: user.id },
      select: { currency: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!dbUser) redirect("/login");

  const currencies = userCurrencies.map((uc) => uc.currency);

  // Default currency is always available even if the join-table row is absent.
  if (!currencies.includes(dbUser.defaultCurrency)) {
    currencies.unshift(dbUser.defaultCurrency);
  }

  return { defaultCurrency: dbUser.defaultCurrency, locale: dbUser.locale, currencies };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function addUserCurrency(formData: FormData) {
  const user = await getUser();
  const currency = (formData.get("currency") as string | null)?.trim();
  if (!currency) return;

  await prisma.userCurrency.upsert({
    where: { userId_currency: { userId: user.id, currency } },
    update: {},
    create: { userId: user.id, currency },
  });

  revalidatePath("/dashboard/settings/currency");
}

export async function removeUserCurrency(formData: FormData) {
  const user = await getUser();
  const currency = formData.get("currency") as string | null;
  if (!currency) return;

  // Never remove the user's default currency.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { defaultCurrency: true },
  });
  if (dbUser?.defaultCurrency === currency) return;

  await prisma.userCurrency.deleteMany({ where: { userId: user.id, currency } });

  revalidatePath("/dashboard/settings/currency");
}

export async function updateDefaultCurrency(formData: FormData) {
  const user = await getUser();
  const currency = (formData.get("currency") as string | null)?.trim();
  if (!currency) return;

  // Ensure the new default is also present in the user_currencies table.
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { defaultCurrency: currency } }),
    prisma.userCurrency.upsert({
      where: { userId_currency: { userId: user.id, currency } },
      update: {},
      create: { userId: user.id, currency },
    }),
  ]);

  revalidatePath("/dashboard/settings/currency");
  revalidatePath("/dashboard");
}
