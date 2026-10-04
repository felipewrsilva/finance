"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { allocateIncome, type AllocationGroupKey } from "@/lib/tools-math";
import { MoneyField } from "@/components/tools/money-field";

const BAR: Record<AllocationGroupKey, string> = {
  fixed: "bg-[var(--text)]",
  comfort: "bg-[var(--primary)]",
  goals: "bg-[var(--warning)]",
  investments: "bg-[var(--success)]",
};

const CARD: Record<AllocationGroupKey, string> = {
  fixed: "bg-[var(--surface)]",
  comfort: "bg-[var(--surface)]",
  goals: "bg-[var(--warning-subtle)]",
  investments: "bg-[var(--success-subtle)]",
};

export function AllocationTool() {
  const t = useTranslations("tools");
  const [income, setIncome] = useState(3000);
  const [open, setOpen] = useState<AllocationGroupKey | null>("fixed");
  const rows = useMemo(() => allocateIncome(Number(income) || 0), [income]);
  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");

  return (
    <div className="space-y-8 sm:space-y-10">
      <MoneyField label={t("monthlyIncome")} value={income} onChange={setIncome} step={50} />
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">{t("allocHint")}</p>
      <ul className="space-y-3">
        {rows.map((row) => {
          const expanded = open === row.key;
          return (
            <li key={row.key}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : row.key)}
                className={`w-full rounded-2xl border border-[var(--border)] p-4 text-left shadow-[var(--elevation-sm)] transition-colors sm:p-5 ${CARD[row.key]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-lg leading-snug sm:text-xl">{t(`alloc_${row.key}`)}</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {row.percentage}% · {expanded ? t("allocClose") : t("allocOpen")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="tabular-nums text-base sm:text-lg">{fmt(row.amount)}</p>
                    <span
                      className={`mt-0.5 inline-block text-[var(--text-muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
                      aria-hidden
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--background)]/80">
                  <div className={`h-full ${BAR[row.key]}`} style={{ width: `${row.percentage}%` }} />
                </div>
                {expanded ? (
                  <ul className="mt-4 space-y-3 border-t border-[var(--border)]/80 pt-4">
                    {row.parts.map((part) => (
                      <li key={part.key}>
                        <div className="flex items-baseline justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-[var(--text)] sm:text-base">{t(`part_${part.key}`)}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
                              {t(`part_${part.key}Hint`)}
                            </p>
                          </div>
                          <p className="shrink-0 tabular-nums text-sm sm:text-base">{fmt(part.amount)}</p>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--background)]/80">
                          <div
                            className={`h-full ${BAR[row.key]} opacity-70`}
                            style={{ width: `${part.ofGroupPct}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)]">{t("allocNote")}</p>
    </div>
  );
}
