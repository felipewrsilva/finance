"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BudgetPeriod } from "@prisma/client";
import { useTranslations } from "next-intl";
import { createBudget, updateBudget } from "@/modules/budgets/actions";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Category, Budget } from "@prisma/client";

interface Props {
  budget?: Budget & { category: Category | null };
  categories: Category[];
  currency?: string;
  locale?: string;
}

export default function BudgetForm({ budget, categories, currency = "BRL", locale = "pt-BR" }: Props) {
  const router = useRouter();
  const t = useTranslations("budgets");
  const tf = useTranslations("form");
  const periodOptions: { value: BudgetPeriod; label: string }[] = [
    { value: "WEEKLY", label: t("weekly") },
    { value: "MONTHLY", label: t("monthly") },
    { value: "YEARLY", label: t("yearly") },
  ];

  const [amount, setAmount] = useState(
    budget?.amount ? Number(budget.amount) : 0
  );

  const fmt = (d: Date) => new Date(d).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState<string>(
    budget ? fmt(budget.startDate) : fmt(new Date())
  );
  const [endDate, setEndDate] = useState<string>(
    budget?.endDate ? fmt(budget.endDate) : ""
  );

  const action = budget
    ? updateBudget.bind(null, budget.id)
    : createBudget;

  return (
    <form action={action} className="space-y-4">
      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t("name")}</label>
        <input
          name="name"
          defaultValue={budget?.name ?? ""}
          placeholder={t("namePlaceholder")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          required
        />
      </div>

      {/* Category (optional) */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t("category")} <span className="text-gray-400">{tf("optional")}</span>
        </label>
        <select
          name="categoryId"
          defaultValue={budget?.categoryId ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">{t("allCategories")}</option>
          {categories
            .filter((c) => c.type === "EXPENSE")
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t("budgetAmount")}</label>
        <CurrencyInput
          name="amount"
          value={amount}
          currency={currency}
          locale={locale}
          onChange={setAmount}
          required
        />
      </div>

      {/* Period */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t("period")}</label>
        <select
          name="period"
          defaultValue={budget?.period ?? "MONTHLY"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          {periodOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Start date */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t("startDate")}</label>
        <DatePicker
          name="startDate"
          value={startDate}
          onChange={setStartDate}
          required
        />
      </div>

      {/* End date */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t("endDate")} <span className="text-gray-400">{tf("optional")}</span>
        </label>
        <DatePicker
          name="endDate"
          value={endDate}
          onChange={setEndDate}
          placeholder={t("noEndDate")}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <SubmitButton
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {budget ? t("saveChanges") : t("createBudget")}
        </SubmitButton>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
