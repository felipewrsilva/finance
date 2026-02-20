"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

async function getUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function getCategories(type?: TransactionType) {
  const user = await getUser();

  return prisma.category.findMany({
    where: {
      OR: [{ userId: null }, { userId: user.id }],
      ...(type ? { type } : {}),
    },
    orderBy: [{ userId: "asc" }, { name: "asc" }],
  });
}

export async function getUserCategories() {
  const user = await getUser();
  return prisma.category.findMany({
    where: { userId: user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function getCategoryById(id: string) {
  const user = await getUser();
  return prisma.category.findFirst({
    where: { id, userId: user.id },
  });
}

export async function createCategory(formData: FormData) {
  const user = await getUser();

  const name = formData.get("name") as string;
  const type = formData.get("type") as TransactionType;
  const icon = (formData.get("icon") as string) || null;
  const color = (formData.get("color") as string) || null;

  if (!name || !type) return;

  await prisma.category.create({
    data: { userId: user.id, name, type, icon, color },
  });

  revalidatePath("/dashboard/settings/categories");
  redirect("/dashboard/settings/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const user = await getUser();

  const name = formData.get("name") as string;
  const icon = (formData.get("icon") as string) || null;
  const color = (formData.get("color") as string) || null;

  if (!name) return;

  await prisma.category.updateMany({
    where: { id, userId: user.id },
    data: { name, icon, color },
  });

  revalidatePath("/dashboard/settings/categories");
  redirect("/dashboard/settings/categories");
}

export async function deleteCategory(id: string) {
  const user = await getUser();
  await prisma.category.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/settings/categories");
}

