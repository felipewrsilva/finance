"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  DEFAULT_CDB_CDI_PCT,
  DEFAULT_SELIC_PCT,
  DEFAULT_WRLD_ANNUAL_PCT,
  POUPANCA_SELIC_CUTOFF,
  cdbAnnualRatePct,
  monthlyFromHorizon,
  poupancaAnnualRatePct,
  projectInvestment,
  tesouroSelicAnnualRatePct,
} from "@/lib/tools-math";
import { fill, tools } from "@/lib/copy";
import { MoneyField, YearPicks } from "@/components/tools/money-field";

const CDI_OPTIONS = [90, 100, 110];

function formatRate(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

export function CompareTool() {
  const [principal, setPrincipal] = useState(500);
  const [monthly, setMonthly] = useState(150);
  const [years, setYears] = useState(10);
  const [selic, setSelic] = useState(DEFAULT_SELIC_PCT);
  const [cdbCdi, setCdbCdi] = useState(DEFAULT_CDB_CDI_PCT);
  const [wrldRate, setWrldRate] = useState(DEFAULT_WRLD_ANNUAL_PCT);

  const selicNum = Number(selic) || 0;
  const poupancaRate = poupancaAnnualRatePct(selicNum);
  const tesouroRate = tesouroSelicAnnualRatePct(selicNum);
  const cdbRate = cdbAnnualRatePct(selicNum, cdbCdi);

  const paths = useMemo(() => {
    const input = {
      principal: Number(principal) || 0,
      monthlyContribution: Number(monthly) || 0,
      years,
    };
    const rows = [
      { key: "poupanca", rate: poupancaRate, bar: "bg-[var(--text)]" },
      { key: "tesouro", rate: tesouroRate, bar: "bg-[var(--warning)]" },
      { key: "cdb", rate: cdbRate, bar: "bg-[var(--primary)]" },
      { key: "wrld", rate: Number(wrldRate) || 0, bar: "bg-[var(--success)]" },
    ] as const;
    const results = rows.map((row) => {
      const atHorizon = projectInvestment({
        ...input,
        annualRatePct: row.rate,
      }).atHorizon;
      return {
        ...row,
        atHorizon,
        perMonth: monthlyFromHorizon(atHorizon, years),
      };
    });
    const max = Math.max(...results.map((r) => r.atHorizon), 1);
    return results.map((row) => ({ ...row, barPct: (row.atHorizon / max) * 100 }));
  }, [principal, monthly, years, poupancaRate, tesouroRate, cdbRate, wrldRate]);

  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");
  const poupancaRule =
    selicNum > POUPANCA_SELIC_CUTOFF ? tools.comparePoupancaHigh : tools.comparePoupancaLow;

  const paperMax = paths.reduce((best, row) => (row.atHorizon > best.atHorizon ? row : best), paths[0]);
  const titles = {
    poupanca: tools.comparePoupanca,
    tesouro: tools.compareTesouro,
    cdb: tools.compareCdb,
    wrld: tools.compareWrld,
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <MoneyField label={tools.principal} value={principal} onChange={setPrincipal} step={50} />
      <MoneyField
        label={tools.monthlyContribution}
        value={monthly}
        onChange={setMonthly}
        step={10}
      />
      <YearPicks label={tools.years} value={years} onChange={setYears} />
      <MoneyField
        label={tools.compareSelic}
        hint={tools.compareSelicHint}
        value={selic}
        onChange={setSelic}
        step={0.1}
        quiet
      />
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">{tools.compareLead}</p>
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
            {row.key === "poupanca" ? (
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{poupancaRule}</p>
            ) : null}
            {row.key === "tesouro" ? (
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                {tools.compareTesouroNote}
              </p>
            ) : null}
            {row.key === "cdb" ? (
              <fieldset className="mt-3">
                <legend className="text-sm text-[var(--text-secondary)]">{tools.compareCdi}</legend>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{tools.compareCdiHint}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {CDI_OPTIONS.map((pct) => {
                    const active = pct === cdbCdi;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setCdbCdi(pct)}
                        className={`min-h-10 rounded-full px-2 py-1.5 text-sm transition-colors ${
                          active
                            ? "bg-[var(--text)] text-[var(--text-inverse)]"
                            : "bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text)]"
                        }`}
                      >
                        {pct}%
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}
            {row.key === "wrld" ? (
              <div className="mt-3">
                <MoneyField
                  label={tools.annualRate}
                  hint={tools.compareWrldNote}
                  value={wrldRate}
                  onChange={setWrldRate}
                  step={0.1}
                  quiet
                />
              </div>
            ) : null}
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
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)]">{tools.compareNote}</p>
    </div>
  );
}
