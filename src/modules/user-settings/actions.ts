"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

const ALL_TYPES: TransactionType[] = ["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT"];
const REQUIRED_TYPES: TransactionType[] = ["INCOME", "EXPENSE"];

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function getEnabledTransactionTypes(): Promise<TransactionType[]> {
  const user = await getUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { enabledTransactionTypes: true },
  });
  if (!dbUser) redirect("/login");

  const types = dbUser.enabledTransactionTypes as TransactionType[];
  return types.length > 0 ? types : ALL_TYPES;
}

export async function toggleTransactionType(
  type: TransactionType,
  _formData: FormData
): Promise<void> {
  const user = await getUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { enabledTransactionTypes: true },
  });
  if (!dbUser) return;

  const current =
    (dbUser.enabledTransactionTypes as TransactionType[]).length > 0
      ? (dbUser.enabledTransactionTypes as TransactionType[])
      : ALL_TYPES;

  let updated: TransactionType[];
  if (REQUIRED_TYPES.includes(type)) return; // INCOME and EXPENSE are always required
  if (current.includes(type)) {
    updated = current.filter((t) => t !== type);
    if (updated.length === 0) return; // must keep at least one
  } else {
    // preserve canonical ordering
    updated = ALL_TYPES.filter((t) => t === type || current.includes(t));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { enabledTransactionTypes: updated },
  });

  revalidatePath("/dashboard/settings/transaction-types");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
}
