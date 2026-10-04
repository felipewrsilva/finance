"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { spendHabitFuture } from "@/lib/tools-math";
import { MoneyField, YearPicks, ResultAmount } from "@/components/tools/money-field";
import { RateNote } from "@/components/tools/rate-note";

export function RedirectTool() {
  const t = useTranslations("tools");
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
        label={t("redirectMonthly")}
        hint={t("redirectMonthlyHint")}
        value={monthly}
        onChange={setMonthly}
        step={10}
      />
      <YearPicks label={t("years")} value={years} onChange={setYears} />
      <div>
        <p className="text-sm text-[var(--text-muted)]">{t("redirectResultLabel", { years })}</p>
        <ResultAmount>{money(future)}</ResultAmount>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-5 sm:text-base">
          {t("redirectStory", { monthly: money(monthly), years, future: money(future) })}
        </p>
        <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
          {t("redirectDaily", { daily: money((Number(monthly) || 0) / 30) })}
        </p>
      </div>
      <RateNote rate={annualRatePct} onRateChange={setAnnualRatePct} />
    </div>
  );
}
