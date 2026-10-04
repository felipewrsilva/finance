"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { deleteBudget } from "@/modules/budgets/actions";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import type { BudgetGroupWithBudgets, BudgetWithSpent } from "@/modules/budgets/actions";
import { formatCurrency } from "@/lib/utils";

interface Props {
  groups: BudgetGroupWithBudgets[];
  currency: string;
}

function BudgetRow({
  budget: b,
  currency,
  locale,
}: {
  budget: BudgetWithSpent;
  currency: string;
  locale: string;
}) {
  const t = useTranslations("budgets");
  const tc = useTranslations("common");
  const periodLabels: Record<string, string> = {
    WEEKLY: t("weekly"),
    MONTHLY: t("monthly"),
    YEARLY: t("yearly"),
  };
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const pct = b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0;
  const over = b.spent > b.amount;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
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

        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className={over ? "font-medium text-red-600" : "text-gray-500"}>
              {t("spent", { amount: fmt(b.spent) })}
            </span>
            <span className="text-gray-400">{t("of", { amount: fmt(b.amount) })}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${
                over ? "bg-red-500" : pct > 80 ? "bg-yellow-400" : "bg-green-500"
              }`}
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

      <div className="flex justify-end border-t border-gray-50 px-4 pb-3 pt-2">
        <InlineConfirmButton
          onConfirm={() => deleteBudget(b.id)}
          confirmLabel={tc("yes_delete")}
          cancelLabel={tc("keep")}
        />
      </div>
    </div>
  );
}

export default function BudgetList({ groups, currency }: Props) {
  const locale = useLocale();
  const t = useTranslations("budgets");
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const totalBudgets = groups.reduce((n, g) => n + g.budgets.length, 0);

  if (totalBudgets === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {t("noBudgets")}{" "}
        <a
          href={`/${locale}/dashboard/budgets/new`}
          className="font-medium text-indigo-600 hover:underline"
        >
          {t("createOne")}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const over = group.totalSpent > group.allocatedAmount && group.allocatedAmount > 0;
        const pct =
          group.allocatedAmount > 0
            ? Math.min((group.totalSpent / group.allocatedAmount) * 100, 100)
            : 0;

        return (
          <section key={group.id} className="space-y-3">
            <div className="rounded-xl border border-indigo-50 bg-indigo-50/40 px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {t(`groupType_${group.type}`)}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {t("groupPercent", { pct: group.percentage })}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className={over ? "font-medium text-red-600" : "text-gray-600"}>
                    {t("spent", { amount: fmt(group.totalSpent) })}
                  </p>
                  <p className="text-gray-400">
                    {t("allocated", { amount: fmt(group.allocatedAmount) })}
                  </p>
                </div>
              </div>
              {group.allocatedAmount > 0 && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/80">
                  <div
                    className={`h-full rounded-full ${
                      over ? "bg-red-500" : pct > 80 ? "bg-yellow-400" : "bg-indigo-500"
                    }`}
                    style={{ width: `${pct.toFixed(1)}%` }}
                  />
                </div>
              )}
            </div>

            {group.budgets.length === 0 ? (
              <p className="px-1 text-xs text-gray-400">{t("noBudgetsInGroup")}</p>
            ) : (
              <div className="space-y-3">
                {group.budgets.map((b) => (
                  <BudgetRow key={b.id} budget={b} currency={currency} locale={locale} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
