"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { projectInvestment } from "@/lib/tools-math";

export function ProjectionTool() {
  const t = useTranslations("tools");
  const [principal, setPrincipal] = useState(10000);
  const [annualRatePct, setAnnualRatePct] = useState(10);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(10);

  const result = useMemo(
    () =>
      projectInvestment({
        principal: Number(principal) || 0,
        annualRatePct: Number(annualRatePct) || 0,
        monthlyContribution: Number(monthlyContribution) || 0,
        years: Math.max(1, Number(years) || 1),
      }),
    [principal, annualRatePct, monthlyContribution, years]
  );

  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t("principal")} value={principal} onChange={setPrincipal} />
        <Field label={t("annualRate")} value={annualRatePct} onChange={setAnnualRatePct} step={0.1} />
        <Field
          label={t("monthlyContribution")}
          value={monthlyContribution}
          onChange={setMonthlyContribution}
        />
        <Field label={t("years")} value={years} onChange={setYears} step={1} />
      </div>

      <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
          {t("projectionResult", { years })}
        </p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-violet-800">
          {fmt(result.atHorizon)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {result.horizons.map((h) => (
          <div key={h.years} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-400">{t("yearsLabel", { years: h.years })}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900">{fmt(h.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      <input
        type="number"
        step={step}
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm tabular-nums text-gray-900 outline-none focus:border-indigo-400"
      />
    </label>
  );
}
