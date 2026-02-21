"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { deleteBudget } from "@/modules/budgets/actions";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import type { BudgetWithSpent } from "@/modules/budgets/actions";
import { formatCurrency } from "@/lib/utils";

interface Props {
  budgets: BudgetWithSpent[];
  currency: string;
}

export default function BudgetList({ budgets, currency }: Props) {
  const locale = useLocale();
  const t = useTranslations("budgets");
  const tc = useTranslations("common");
  const periodLabels: Record<string, string> = {
    WEEKLY: t("weekly"),
    MONTHLY: t("monthly"),
    YEARLY: t("yearly"),
  };
  const fmt = (v: number) => formatCurrency(v, currency, locale);

  if (budgets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {t("noBudgets")}{" "}
        <a href={`/${locale}/dashboard/budgets/new`} className="font-medium text-indigo-600 hover:underline">
          {t("createOne")}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {budgets.map((b) => {
        const pct = b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0;
        const over = b.spent > b.amount;

        return (
          <div key={b.id} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
            {/* Clickable area — navigates to edit */}
            <Link
              href={`/${locale}/dashboard/budgets/${b.id}/edit`}
              className="block p-4 transition-colors hover:bg-gray-50/60 active:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
            >
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  {b.categoryIcon && <span>{b.categoryIcon}</span>}
                  <span className="font-medium text-gray-900">{b.name}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {periodLabels[b.period]}
                  </span>
                </div>
                {b.categoryName && (
                  <p className="mt-0.5 text-xs text-gray-400">{b.categoryName}</p>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className={over ? "font-medium text-red-600" : "text-gray-500"}>
                    {t("spent", { amount: fmt(b.spent) })}
                  </span>
                  <span className="text-gray-400">{t("of", { amount: fmt(b.amount) })}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${over ? "bg-red-500" : pct > 80 ? "bg-yellow-400" : "bg-green-500"}`}
                    style={{ width: `${pct.toFixed(1)}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-gray-400">
                  {over
                    ? t("overBudget", { amount: fmt(b.spent - b.amount) })
                    : t("remaining", { amount: fmt(b.amount - b.spent) })}
                </p>
              </div>
            </Link>

            {/* Footer — delete */}
            <div className="flex justify-end px-4 pb-3 pt-2 border-t border-gray-50">
              <InlineConfirmButton
                onConfirm={() => deleteBudget(b.id)}
                confirmLabel={tc("yes_delete")}
                cancelLabel={tc("keep")}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
