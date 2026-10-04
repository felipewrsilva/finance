"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { COMPARE_RATES } from "@/lib/compare-rates";
import { projectInvestment } from "@/lib/tools-math";
import { fill, tools } from "@/lib/copy";
import { MoneyField, YearPicks, ResultAmount } from "@/components/tools/money-field";
import { RateNote } from "@/components/tools/rate-note";

export function ProjectionTool() {
  const [principal, setPrincipal] = useState(500);
  const [monthlyContribution, setMonthlyContribution] = useState(150);
  const [years, setYears] = useState(10);
  const [annualRatePct, setAnnualRatePct] = useState<number>(COMPARE_RATES.selicPct);

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
      <MoneyField
        label={tools.principal}
        value={principal}
        onChange={setPrincipal}
        step={50}
        prefix="R$"
      />
      <MoneyField
        label={tools.monthlyContribution}
        value={monthlyContribution}
        onChange={setMonthlyContribution}
        step={10}
        prefix="R$"
      />
      <YearPicks label={tools.years} value={years} onChange={setYears} />
      <div>
        <p className="text-sm text-[var(--text-muted)]">{fill(tools.projectionResult, { years })}</p>
        <ResultAmount tone="success">{formatCurrency(result.atHorizon)}</ResultAmount>
      </div>
      <RateNote rate={annualRatePct} onRateChange={setAnnualRatePct} />
    </div>
  );
}
