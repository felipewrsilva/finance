"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { spendHabitFuture } from "@/lib/tools-math";
import { MoneyField, YearPicks, ResultAmount } from "@/components/tools/money-field";

export function RedirectTool() {
  const t = useTranslations("tools");
  const [monthly, setMonthly] = useState(150);
  const [years, setYears] = useState(10);
  const [annualRatePct, setAnnualRatePct] = useState(8);
  const [showRate, setShowRate] = useState(false);

  const future = useMemo(
    () => spendHabitFuture(Number(monthly) || 0, Number(annualRatePct) || 0, years),
    [monthly, annualRatePct, years]
  );
  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");

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
        <ResultAmount>{fmt(future)}</ResultAmount>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-5 sm:text-base">
          {t("redirectStory", { monthly: fmt(monthly), years, future: fmt(future) })}
        </p>
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
