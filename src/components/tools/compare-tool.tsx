"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { COMPARE_RATES } from "@/lib/compare-rates";
import {
  afterIrPct,
  cdbAnnualRatePct,
  monthlyFromHorizon,
  poupancaAnnualRatePct,
  projectByYear,
  projectInvestment,
  tesouroSelicAnnualRatePct,
} from "@/lib/tools-math";
import { fill, tools } from "@/lib/copy";
import { MoneyField, YearPicks } from "@/components/tools/money-field";
import { CompareChart } from "@/components/tools/compare-chart";

function formatRate(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

function formatDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const PATH_META = [
  { key: "poupanca", bar: "bg-[var(--text)]" },
  { key: "tesouro", bar: "bg-[var(--warning)]" },
  { key: "cdb", bar: "bg-[var(--primary)]" },
  { key: "bova", bar: "bg-[var(--success)]" },
] as const;

const PATH_RATES = {
  poupanca: poupancaAnnualRatePct(COMPARE_RATES.selicPct),
  tesouro: afterIrPct(tesouroSelicAnnualRatePct(COMPARE_RATES.selicPct), COMPARE_RATES.irPct),
  cdb: afterIrPct(
    cdbAnnualRatePct(COMPARE_RATES.selicPct, COMPARE_RATES.cdbCdiPct),
    COMPARE_RATES.irPct
  ),
  bova: COMPARE_RATES.equity12mPct,
} as const;

export function CompareTool() {
  const [principal, setPrincipal] = useState(500);
  const [monthly, setMonthly] = useState(150);
  const [years, setYears] = useState(10);

  const selic = COMPARE_RATES.selicPct;
  const poupancaRate = PATH_RATES.poupanca;
  const tesouroGross = tesouroSelicAnnualRatePct(selic);
  const cdbGross = cdbAnnualRatePct(selic, COMPARE_RATES.cdbCdiPct);
  const tesouroRate = PATH_RATES.tesouro;
  const cdbRate = PATH_RATES.cdb;

  const titles = {
    poupanca: tools.comparePoupanca,
    tesouro: tools.compareTesouro,
    cdb: tools.compareCdb,
    bova: tools.compareWrld,
  };

  const paths = useMemo(() => {
    const input = {
      principal: Number(principal) || 0,
      monthlyContribution: Number(monthly) || 0,
      years,
    };
    const results = PATH_META.map((row) => {
      const rate = PATH_RATES[row.key];
      const atHorizon = projectInvestment({ ...input, annualRatePct: rate }).atHorizon;
      return {
        ...row,
        rate,
        atHorizon,
        perMonth: monthlyFromHorizon(atHorizon, years),
        points: projectByYear({ ...input, annualRatePct: rate }),
      };
    });
    const max = Math.max(...results.map((r) => r.atHorizon), 1);
    return results.map((row) => ({ ...row, barPct: (row.atHorizon / max) * 100 }));
  }, [principal, monthly, years]);

  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");
  const paperMax = paths.reduce((best, row) => (row.atHorizon > best.atHorizon ? row : best), paths[0]);

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
        value={monthly}
        onChange={setMonthly}
        step={10}
        prefix="R$"
      />
      <YearPicks label={tools.years} value={years} onChange={setYears} />
      <p className="max-w-md text-sm leading-relaxed text-[var(--text)]">
        {fill(tools.compareSelicNow, { rate: formatRate(selic) })}
      </p>
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">{tools.compareLead}</p>
      <div>
        <p className="mb-3 font-display text-lg text-[var(--text)]">{tools.compareChartTitle}</p>
        <CompareChart series={paths} labels={titles} title={tools.compareChartTitle} />
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {paths.map((row) => (
          <li
            key={row.key}
            className={`rounded-2xl border p-4 shadow-[var(--elevation-sm)] sm:p-5 ${
              row.key === paperMax.key
                ? "border-[var(--border-strong)] bg-[var(--surface-elevated)]"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            <p className="font-display text-lg leading-snug sm:text-xl">{titles[row.key]}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {fill(tools.compareRateLine, { rate: formatRate(row.rate) })}
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--background)]/80">
              <div className={`h-full ${row.bar}`} style={{ width: `${row.barPct}%` }} />
            </div>
            <p className="mt-4 text-sm text-[var(--text-muted)]">{tools.compareEnd}</p>
            <p className="mt-1 font-display text-2xl tabular-nums leading-tight sm:text-3xl">
              {fmt(row.atHorizon)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              {fill(tools.compareMonthlyLine, { monthly: fmt(row.perMonth) })}
            </p>
          </li>
        ))}
      </ul>
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
        {fill(tools.comparePaperMax, { name: titles[paperMax.key] })}
      </p>
      <div className="max-w-md space-y-2 text-xs leading-relaxed text-[var(--text-muted)]">
        <p>{tools.compareLegendTitle}</p>
        <p>{fill(tools.compareLegendPoupanca, { rate: formatRate(poupancaRate) })}</p>
        <p>
          {fill(tools.compareLegendTesouro, {
            gross: formatRate(tesouroGross),
            rate: formatRate(tesouroRate),
            ir: formatRate(COMPARE_RATES.irPct),
          })}
        </p>
        <p>
          {fill(tools.compareLegendCdb, {
            cdi: formatRate(COMPARE_RATES.cdbCdiPct),
            gross: formatRate(cdbGross),
            rate: formatRate(cdbRate),
            ir: formatRate(COMPARE_RATES.irPct),
          })}
        </p>
        <p>
          {fill(tools.compareLegendWrld, { rate: formatRate(PATH_RATES.bova) })}{" "}
          <a
            href={COMPARE_RATES.equityHref}
            className="underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--text-secondary)]"
          >
            ETFs Brasil
          </a>
          .
        </p>
        <p>
          {fill(tools.compareLegendAsOf, { date: formatDay(COMPARE_RATES.asOf) })}{" "}
          <a
            href={COMPARE_RATES.selicHref}
            className="underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--text-secondary)]"
          >
            Agência Brasil
          </a>
          .
        </p>
      </div>
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)]">{tools.compareNote}</p>
    </div>
  );
}
