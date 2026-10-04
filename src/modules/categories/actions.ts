"use server";

import { personalFeaturesDisabled } from "@/lib/personal-features";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BudgetGroupType, TransactionType } from "@prisma/client";

async function getUser(): Promise<{ id: string; defaultCurrency?: string; locale?: string }> {
  return personalFeaturesDisabled();
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

function parseIsEssential(value: FormDataEntryValue | null): boolean {
  if (value == null || value === "") return true;
  return value === "true" || value === "on" || value === "1";
}

function parseGroupType(value: FormDataEntryValue | null): BudgetGroupType | null {
  if (value == null || value === "") return null;
  const allowed = Object.values(BudgetGroupType) as string[];
  return allowed.includes(String(value)) ? (value as BudgetGroupType) : null;
}

export async function createCategory(formData: FormData) {
  const user = await getUser();

  const name = formData.get("name") as string;
  const type = formData.get("type") as TransactionType;
  const icon = (formData.get("icon") as string) || null;
  const color = (formData.get("color") as string) || null;
  const isEssential = parseIsEssential(formData.get("isEssential"));
  const groupType = parseGroupType(formData.get("groupType"));

  if (!name || !type) return;

  await prisma.category.create({
    data: { userId: user.id, name, type, icon, color, isEssential, groupType },
  });

  revalidatePath("/dashboard/settings/categories");
  redirect("/dashboard/settings/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const user = await getUser();

  const name = formData.get("name") as string;
  const icon = (formData.get("icon") as string) || null;
  const color = (formData.get("color") as string) || null;
  const isEssential = parseIsEssential(formData.get("isEssential"));
  const groupType = parseGroupType(formData.get("groupType"));

  if (!name) return;

  await prisma.category.updateMany({
    where: { id, userId: user.id },
    data: { name, icon, color, isEssential, groupType },
  });

  revalidatePath("/dashboard/settings/categories");
  redirect("/dashboard/settings/categories");
}

export async function deleteCategory(id: string) {
  const user = await getUser();
  await prisma.category.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/settings/categories");
}

