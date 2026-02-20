"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
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
}

export async function deleteCategory(id: string) {
  const user = await getUser();
  await prisma.category.deleteMany({ where: { id, userId: user.id } });
}
