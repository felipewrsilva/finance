"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { fill, tools } from "@/lib/copy";
import { MoneyField, YearPicks } from "@/components/tools/money-field";
import { FreedomChart } from "@/components/tools/freedom-chart";
import {
  FREEDOM_RATES,
  corpusForMonthlyIncome,
  growToTargetByYear,
  monthlyFromCorpus,
  monthlyToReach,
  netNominalPct,
  realYieldPct,
} from "@/lib/freedom-math";

function formatRate(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

const NET_PCT = netNominalPct(FREEDOM_RATES.selicPct, FREEDOM_RATES.irPct);
const REAL_PCT = realYieldPct(NET_PCT, FREEDOM_RATES.ipcaPct);

const EXAMPLES = [
  { key: "tesouro", label: tools.freedomTesouro, hint: tools.freedomTesouroHint },
  { key: "cdb", label: tools.freedomCdb, hint: tools.freedomCdbHint },
  { key: "lci", label: tools.freedomLci, hint: tools.freedomLciHint },
] as const;

export function FreedomTool() {
  const [income, setIncome] = useState(2500);
  const [principal, setPrincipal] = useState(500);
  const [years, setYears] = useState(10);
  const [open, setOpen] = useState<string | null>("tesouro");

  const selic = FREEDOM_RATES.selicPct;
  const netPct = NET_PCT;
  const realPct = REAL_PCT;

  const plan = useMemo(() => {
    const want = Math.max(0, Number(income) || 0);
    const have = Math.max(0, Number(principal) || 0);
    const nowCorpus = corpusForMonthlyIncome(want, NET_PCT);
    const realCorpus = corpusForMonthlyIncome(want, REAL_PCT);
    const nowCovered = monthlyFromCorpus(have, NET_PCT);
    const realCovered = monthlyFromCorpus(have, REAL_PCT);
    const monthNow = monthlyToReach({
      target: nowCorpus,
      principal: have,
      annualRatePct: NET_PCT,
      years,
    });
    const monthReal = monthlyToReach({
      target: realCorpus,
      principal: have,
      annualRatePct: NET_PCT,
      years,
    });
    const points = growToTargetByYear({
      principal: have,
      monthly: monthReal,
      annualRatePct: NET_PCT,
      years,
    });
    return {
      want,
      have,
      nowCorpus,
      realCorpus,
      nowCovered,
      realCovered,
      monthNow,
      monthReal,
      alreadyReal: realCorpus > 0 && have >= realCorpus,
      points,
    };
  }, [income, principal, years]);

  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");

  return (
    <div className="space-y-8 sm:space-y-10">
      <MoneyField label={tools.freedomIncome} value={income} onChange={setIncome} step={50} />
      <MoneyField label={tools.principal} value={principal} onChange={setPrincipal} step={50} />
      <YearPicks label={tools.years} value={years} onChange={setYears} />

      <p className="max-w-md text-sm leading-relaxed text-[var(--text)]">
        {fill(tools.freedomSelicNow, { rate: formatRate(selic) })}
      </p>
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">{tools.freedomLead}</p>

      <ul className="grid gap-3 sm:grid-cols-2">
        <li className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-4 shadow-[var(--elevation-sm)] sm:p-5">
          <p className="font-display text-lg leading-snug sm:text-xl">{tools.freedomNeedTitle}</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{tools.freedomNeedReal}</p>
          <p className="mt-3 font-display text-2xl tabular-nums leading-tight sm:text-3xl">
            {fmt(plan.realCorpus)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            {fill(tools.freedomNeedNow, { amount: fmt(plan.nowCorpus) })}
          </p>
        </li>
        <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--elevation-sm)] sm:p-5">
          <p className="font-display text-lg leading-snug sm:text-xl">{tools.freedomMonthTitle}</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {fill(tools.freedomMonthReal, { years: String(years) })}
          </p>
          <p className="mt-3 font-display text-2xl tabular-nums leading-tight text-[var(--primary)] sm:text-3xl">
            {plan.alreadyReal ? tools.freedomAlready : fmt(plan.monthReal)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            {fill(tools.freedomMonthNow, { amount: fmt(plan.monthNow) })}
          </p>
        </li>
      </ul>

      <div>
        <p className="mb-3 font-display text-lg text-[var(--text)]">{tools.freedomChartTitle}</p>
        <FreedomChart
          points={plan.points}
          target={plan.realCorpus}
          title={tools.freedomChartTitle}
          todayLabel={tools.freedomChartToday}
          yearsLabel={tools.freedomChartYears}
          targetLabel={fill(tools.freedomChartTarget, { amount: fmt(plan.realCorpus) })}
        />
      </div>

      <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
        {fill(tools.freedomCovered, {
          now: fmt(plan.nowCovered),
          real: fmt(plan.realCovered),
        })}
      </p>

      <div>
        <p className="mb-3 font-display text-lg text-[var(--text)]">{tools.freedomExamplesTitle}</p>
        <ul className="space-y-2">
          {EXAMPLES.map((row) => {
            const isOpen = open === row.key;
            return (
              <li key={row.key}>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-[var(--elevation-sm)] sm:p-5"
                  onClick={() => setOpen(isOpen ? null : row.key)}
                  aria-expanded={isOpen}
                >
                  <p className="font-display text-base sm:text-lg">{row.label}</p>
                  {isOpen ? (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{row.hint}</p>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="max-w-md space-y-2 text-xs leading-relaxed text-[var(--text-muted)]">
        <p>{tools.freedomLegendTitle}</p>
        <p>
          {fill(tools.freedomLegendNet, {
            gross: formatRate(selic),
            net: formatRate(netPct),
            ir: formatRate(FREEDOM_RATES.irPct),
          })}{" "}
          <a
            href={FREEDOM_RATES.selicHref}
            className="underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--text-secondary)]"
          >
            Agência Brasil
          </a>
          .
        </p>
        <p>
          {fill(tools.freedomLegendReal, {
            ipca: formatRate(FREEDOM_RATES.ipcaPct),
            real: formatRate(realPct),
          })}{" "}
          <a
            href={FREEDOM_RATES.ipcaHref}
            className="underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--text-secondary)]"
          >
            Boletim Focus
          </a>
          .
        </p>
        <p>{tools.freedomLegendKeep}</p>
      </div>
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)]">{tools.freedomNote}</p>
    </div>
  );
}
