"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { allocateIncome } from "@/lib/tools-math";
import { MoneyField } from "@/components/tools/money-field";

const BAR: Record<string, string> = {
  fixed: "bg-[var(--text)]",
  comfort: "bg-[var(--primary)]",
  goals: "bg-[var(--warning)]",
  investments: "bg-[var(--success)]",
};

export function AllocationTool() {
  const t = useTranslations("tools");
  const [income, setIncome] = useState(3000);
  const rows = useMemo(() => allocateIncome(Number(income) || 0), [income]);
  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");

  return (
    <div className="space-y-8 sm:space-y-10">
      <MoneyField label={t("monthlyIncome")} value={income} onChange={setIncome} step={50} />
      <ul className="space-y-5 sm:space-y-6">
        {rows.map((row) => (
          <li key={row.key}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 font-display text-lg sm:text-xl">{t(`alloc_${row.key}`)}</p>
              <p className="shrink-0 tabular-nums text-base sm:text-lg">{fmt(row.amount)}</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className={`h-full ${BAR[row.key]}`} style={{ width: `${row.percentage}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
