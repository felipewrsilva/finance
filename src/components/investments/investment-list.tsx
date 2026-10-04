"use client";

import { useTranslations } from "next-intl";
import { deleteInvestment } from "@/modules/investments/actions";
import { INVESTMENT_STATUS_COLORS, INVESTMENT_STATUS_LABELS } from "@/modules/investments/constants";
import { totalProjectedValue } from "@/modules/investments/projections";
import { investmentAsOfMs, yearsElapsedSince } from "@/modules/investments/time";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Investment, InvestmentCategory } from "@prisma/client";

type InvestmentWithCategory = Investment & { category: InvestmentCategory };

interface InvestmentListProps {
  investments: InvestmentWithCategory[];
  currency?: string;
  locale?: string;
  onAdd?: () => void;
  onEdit?: (investment: InvestmentWithCategory) => void;
}

export function InvestmentList({
  investments,
  currency = "BRL",
  locale = "pt-BR",
  onAdd,
  onEdit,
}: InvestmentListProps) {
  const t = useTranslations("investments");
  const tc = useTranslations("common");
  const asOfMs = investmentAsOfMs();

  if (investments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
        <p className="text-4xl mb-3" aria-hidden="true">📈</p>
        <p className="font-medium text-gray-600">{t("noInvestments")}</p>
        <p className="text-sm mt-1 mb-5 text-gray-400">{t("addFirst")}</p>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            {t("addInvestment")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
      aria-label="Investments"
      role="list"
    >
      {investments.map((inv, i) => {
        const rate = Number(inv.annualInterestRate) / 100;
        const principal = Number(inv.principalAmount);
        const yearsElapsed = yearsElapsedSince(new Date(inv.startDate), asOfMs);
        const currentValue = totalProjectedValue(
          principal,
          rate,
          Math.max(yearsElapsed, 0),
          inv.recurrenceAmount ? Number(inv.recurrenceAmount) : 0,
          inv.recurrenceInterval ?? null
        );
        const gain = currentValue - principal;
        const gainPct = principal > 0 ? ((gain / principal) * 100).toFixed(2) : "0.00";

        return (
          <div
            key={inv.id}
            role="listitem"
            className={`group flex items-center transition-colors hover:bg-gray-50/70 ${
              i !== investments.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => onEdit?.(inv)}
              className="flex flex-1 min-w-0 items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-lg">
                📈
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {inv.customCategoryName ?? inv.category.name}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 ${INVESTMENT_STATUS_COLORS[inv.status]}`}
                  >
                    {INVESTMENT_STATUS_LABELS[inv.status]}
                  </span>
                  {inv.recurring && (
                    <span className="shrink-0 rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-500">
                      ↻
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                  <span>
                    {formatDate(new Date(inv.startDate), locale, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span>·</span>
                  <span>{Number(inv.annualInterestRate).toFixed(2)}{t("perYrSuffix")}</span>
                  {gain !== 0 && (
                    <>
                      <span>·</span>
                      <span className={gain >= 0 ? "text-emerald-500" : "text-red-400"}>
                        {gain >= 0 ? "+" : ""}{gainPct}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-violet-600">
                  {formatCurrency(currentValue, currency, locale)}
                </p>
                <p className="text-xs text-gray-400 tabular-nums">
                  {t("principal")}: {formatCurrency(principal, currency, locale)}
                </p>
              </div>
            </button>

            <div className="shrink-0 pr-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <InlineConfirmButton
                onConfirm={() => deleteInvestment(inv.id)}
                label={tc("delete")}
                confirmLabel={tc("yes_delete")}
                cancelLabel={tc("keep")}
                showAsText
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
