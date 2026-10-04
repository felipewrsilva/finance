"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { COMPARE_RATES } from "@/lib/compare-rates";
import { spendHabitFuture } from "@/lib/tools-math";
import { fill, tools } from "@/lib/copy";
import { MoneyField, YearPicks, ResultAmount } from "@/components/tools/money-field";
import { RateNote } from "@/components/tools/rate-note";

export function RedirectTool() {
  const [monthly, setMonthly] = useState(150);
  const [years, setYears] = useState(10);
  const [annualRatePct, setAnnualRatePct] = useState<number>(COMPARE_RATES.selicPct);

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
        prefix="R$"
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
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
          {tools.redirectToProjection}{" "}
          <a
            href="/ferramentas/projecao"
            className="underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--text)]"
          >
            {tools.redirectToProjectionLink}
          </a>
          .
        </p>
      </div>
      <RateNote rate={annualRatePct} onRateChange={setAnnualRatePct} />
    </div>
  );
}
