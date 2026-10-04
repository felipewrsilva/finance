"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { spendHabitFuture } from "@/lib/tools-math";
import { fill, tools } from "@/lib/copy";
import { MoneyField, YearPicks, ResultAmount } from "@/components/tools/money-field";
import { RateNote } from "@/components/tools/rate-note";

export function RedirectTool() {
  const [monthly, setMonthly] = useState(150);
  const [years, setYears] = useState(10);
  const [annualRatePct, setAnnualRatePct] = useState(8);

  const future = useMemo(
    () => spendHabitFuture(Number(monthly) || 0, Number(annualRatePct) || 0, years),
    [monthly, annualRatePct, years]
  );
  const money = (v: number) => formatCurrency(v);

  return (
    <div className="space-y-8 sm:space-y-10">
      <MoneyField
        label={tools.redirectMonthly}
        hint={tools.redirectMonthlyHint}
        value={monthly}
        onChange={setMonthly}
        step={10}
      />
      <YearPicks label={tools.years} value={years} onChange={setYears} />
      <div>
        <p className="text-sm text-[var(--text-muted)]">
          {fill(tools.redirectResultLabel, { years })}
        </p>
        <ResultAmount>{money(future)}</ResultAmount>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-5 sm:text-base">
          {fill(tools.redirectStory, { monthly: money(monthly), years, future: money(future) })}
        </p>
        <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
          {fill(tools.redirectDaily, { daily: money((Number(monthly) || 0) / 30) })}
        </p>
      </div>
      <RateNote rate={annualRatePct} onRateChange={setAnnualRatePct} />
    </div>
  );
}
