"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { projectInvestment } from "@/lib/tools-math";
import { MoneyField, YearPicks, ResultAmount } from "@/components/tools/money-field";

export function ProjectionTool() {
  const t = useTranslations("tools");
  const [principal, setPrincipal] = useState(500);
  const [monthlyContribution, setMonthlyContribution] = useState(150);
  const [years, setYears] = useState(10);
  const [annualRatePct, setAnnualRatePct] = useState(8);
  const [showRate, setShowRate] = useState(false);

  const result = useMemo(
    () =>
      projectInvestment({
        principal: Number(principal) || 0,
        annualRatePct: Number(annualRatePct) || 0,
        monthlyContribution: Number(monthlyContribution) || 0,
        years,
      }),
    [principal, annualRatePct, monthlyContribution, years]
  );
  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");

  return (
    <div className="space-y-8 sm:space-y-10">
      <MoneyField label={t("principal")} value={principal} onChange={setPrincipal} step={50} />
      <MoneyField
        label={t("monthlyContribution")}
        value={monthlyContribution}
        onChange={setMonthlyContribution}
        step={10}
      />
      <YearPicks label={t("years")} value={years} onChange={setYears} />

      <div>
        <p className="text-sm text-[var(--text-muted)]">{t("projectionResult", { years })}</p>
        <ResultAmount tone="success">{fmt(result.atHorizon)}</ResultAmount>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowRate((v) => !v)}
          className="text-sm text-[var(--text-muted)] underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--text)]"
        >
          {showRate ? t("hideRate") : t("showRate")}
        </button>
        {showRate ? (
          <div className="mt-4">
            <MoneyField
              label={t("annualRate")}
              hint={t("rateHint")}
              value={annualRatePct}
              onChange={setAnnualRatePct}
              step={0.1}
              quiet
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--text-muted)]">{t("rateQuiet", { rate: annualRatePct })}</p>
        )}
      </div>
    </div>
  );
}
