"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { allocateIncome } from "@/lib/tools-math";

export function AllocationTool() {
  const t = useTranslations("tools");
  const [income, setIncome] = useState(8000);

  const rows = useMemo(() => allocateIncome(Number(income) || 0), [income]);
  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");

  return (
    <div className="space-y-6">
      <label className="block max-w-sm">
        <span className="mb-1 block text-xs font-medium text-gray-500">{t("monthlyIncome")}</span>
        <input
          type="number"
          min={0}
          step={100}
          value={Number.isFinite(income) ? income : 0}
          onChange={(e) => setIncome(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm tabular-nums text-gray-900 outline-none focus:border-indigo-400"
        />
      </label>

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{t(`alloc_${row.key}`)}</p>
              <p className="text-xs text-gray-400">{row.percentage}%</p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-gray-900">{fmt(row.amount)}</p>
          </div>
        ))}
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
        <div className="flex h-full">
          <div className="bg-indigo-500" style={{ width: "50%" }} />
          <div className="bg-sky-400" style={{ width: "30%" }} />
          <div className="bg-amber-400" style={{ width: "10%" }} />
          <div className="bg-violet-500" style={{ width: "10%" }} />
        </div>
      </div>
    </div>
  );
}
