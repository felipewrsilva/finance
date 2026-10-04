"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { redirectImpact } from "@/lib/tools-math";

export function RedirectTool() {
  const t = useTranslations("tools");
  const [principal, setPrincipal] = useState(5000);
  const [annualRatePct, setAnnualRatePct] = useState(10);
  const [currentMonthly, setCurrentMonthly] = useState(200);
  const [redirectMonthly, setRedirectMonthly] = useState(400);
  const [years, setYears] = useState(10);

  const result = useMemo(
    () =>
      redirectImpact({
        principal: Number(principal) || 0,
        annualRatePct: Number(annualRatePct) || 0,
        currentMonthly: Number(currentMonthly) || 0,
        redirectMonthly: Number(redirectMonthly) || 0,
        years: Math.max(1, Number(years) || 1),
      }),
    [principal, annualRatePct, currentMonthly, redirectMonthly, years]
  );

  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t("principal")} value={principal} onChange={setPrincipal} />
        <Field label={t("annualRate")} value={annualRatePct} onChange={setAnnualRatePct} step={0.1} />
        <Field
          label={t("currentMonthlyInvest")}
          value={currentMonthly}
          onChange={setCurrentMonthly}
        />
        <Field
          label={t("redirectMonthly")}
          value={redirectMonthly}
          onChange={setRedirectMonthly}
        />
        <Field label={t("years")} value={years} onChange={setYears} step={1} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label={t("currentPath")} value={fmt(result.current)} />
        <Stat label={t("optimizedPath")} value={fmt(result.optimized)} accent />
        <Stat label={t("extraGain")} value={`+${fmt(result.delta)}`} accent />
      </div>

      <p className="text-sm text-gray-500">
        {t("redirectSummary", {
          monthly: fmt(result.optimizedMonthly),
          years,
          delta: fmt(result.delta),
        })}
      </p>
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

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        accent ? "border-violet-100 bg-violet-50/60" : "border-gray-100 bg-white"
      }`}
    >
      <p className="text-xs text-gray-400">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold tabular-nums ${
          accent ? "text-violet-800" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
