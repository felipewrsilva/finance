"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { projectInvestment } from "@/lib/tools-math";
import { MoneyField, YearPicks, ResultAmount } from "@/components/tools/money-field";
import { RateNote } from "@/components/tools/rate-note";

export function ProjectionTool() {
  const t = useTranslations("tools");
  const [principal, setPrincipal] = useState(500);
  const [monthlyContribution, setMonthlyContribution] = useState(150);
  const [years, setYears] = useState(10);
  const [annualRatePct, setAnnualRatePct] = useState(8);

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
        <ResultAmount tone="success">{formatCurrency(result.atHorizon)}</ResultAmount>
      </div>
      <RateNote rate={annualRatePct} onRateChange={setAnnualRatePct} />
    </div>
  );
}
