"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { accountSchema } from "./schema";

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function getAccounts() {
  const user = await getUser();
  return prisma.account.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createAccount(formData: FormData) {
  const user = await getUser();

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    balance: formData.get("balance"),
    color: formData.get("color") || undefined,
    icon: formData.get("icon") || undefined,
  });

  if (!parsed.success) return;

  await prisma.account.create({
    data: { ...parsed.data, userId: user.id },
  });

  revalidatePath("/dashboard/accounts");
  redirect("/dashboard/accounts");
}

export async function updateAccount(id: string, formData: FormData) {
  const user = await getUser();

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    balance: formData.get("balance"),
    color: formData.get("color") || undefined,
    icon: formData.get("icon") || undefined,
  });

  if (!parsed.success) return;

  await prisma.account.updateMany({
    where: { id, userId: user.id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/accounts");
  redirect("/dashboard/accounts");
}

export async function deleteAccount(id: string) {
  const user = await getUser();

  await prisma.account.updateMany({
    where: { id, userId: user.id },
    data: { isActive: false },
  });

  revalidatePath("/dashboard/accounts");
}
