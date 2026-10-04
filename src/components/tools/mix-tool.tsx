"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  MIX_FIXED_MAX,
  MIX_FIXED_MIN,
  clampMixFixedPct,
  mixFixedPctFromYears,
  mixSlices,
} from "@/lib/tools-math";
import { fill, tools } from "@/lib/copy";
import { MoneyField, YearPicks } from "@/components/tools/money-field";

type MixGroup = "quiet" | "swing";

const GROUP: Record<MixGroup, string> = {
  quiet: tools.mix_quiet,
  swing: tools.mix_swing,
};

const GROUP_LEAD: Record<MixGroup, string> = {
  quiet: tools.mix_quietLead,
  swing: tools.mix_swingLead,
};

const PART: Record<MixGroup, { key: string; label: string; hint: string }[]> = {
  quiet: [
    { key: "poupanca", label: tools.mix_poupanca, hint: tools.mix_poupancaHint },
    { key: "tesouro", label: tools.mix_tesouro, hint: tools.mix_tesouroHint },
    { key: "cdb", label: tools.mix_cdb, hint: tools.mix_cdbHint },
  ],
  swing: [
    { key: "bolsa", label: tools.mix_bolsa, hint: tools.mix_bolsaHint },
    { key: "wrld", label: tools.mix_wrld, hint: tools.mix_wrldHint },
  ],
};

const BAR: Record<MixGroup, string> = {
  quiet: "bg-[var(--text)]",
  swing: "bg-[var(--primary)]",
};

const CARD: Record<MixGroup, string> = {
  quiet: "bg-[var(--surface)]",
  swing: "bg-[var(--primary-subtle)]",
};

export function MixTool() {
  const [principal, setPrincipal] = useState(500);
  const [monthly, setMonthly] = useState(150);
  const [years, setYears] = useState(10);
  const [fixedPct, setFixedPct] = useState(() => mixFixedPctFromYears(10));
  const [customSplit, setCustomSplit] = useState(false);
  const [open, setOpen] = useState<MixGroup | null>("quiet");

  const suggested = mixFixedPctFromYears(years);
  const now = useMemo(
    () => mixSlices(Number(principal) || 0, fixedPct),
    [principal, fixedPct]
  );
  const month = useMemo(
    () => mixSlices(Number(monthly) || 0, fixedPct),
    [monthly, fixedPct]
  );
  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");

  function changeYears(next: number) {
    setYears(next);
    if (!customSplit) setFixedPct(mixFixedPctFromYears(next));
  }

  function changeSplit(next: number) {
    setCustomSplit(true);
    setFixedPct(clampMixFixedPct(next));
  }

  const rows: { key: MixGroup; percentage: number; amount: number }[] = [
    { key: "quiet", percentage: now.fixedPct, amount: now.fixedAmount },
    { key: "swing", percentage: now.variablePct, amount: now.variableAmount },
  ];

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
        hint={tools.mixMonthlyHint}
        value={monthly}
        onChange={setMonthly}
        step={10}
        prefix="R$"
      />
      <YearPicks
        label={tools.mixHorizonHint}
        value={years}
        onChange={changeYears}
        options={[3, 10, 20]}
        captions={[tools.mixYear3, tools.mixYear10, tools.mixYear20]}
      />
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">{tools.mixHorizonNote}</p>
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
        {customSplit
          ? fill(tools.mixRuleCustom, { suggested })
          : fill(tools.mixRule, { fixed: now.fixedPct, variable: now.variablePct })}
      </p>
      {customSplit ? (
        <button
          type="button"
          onClick={() => {
            setCustomSplit(false);
            setFixedPct(suggested);
          }}
          className="text-sm text-[var(--text-muted)] underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--text)]"
        >
          {tools.mixReset}
        </button>
      ) : null}
      <label className="block">
        <span className="block font-display text-base text-[var(--text)] sm:text-lg">
          {tools.mixSlider}
        </span>
        <input
          type="range"
          min={MIX_FIXED_MIN}
          max={MIX_FIXED_MAX}
          step={1}
          value={fixedPct}
          onChange={(e) => changeSplit(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--primary)]"
        />
        <span className="mt-1 flex justify-between text-sm text-[var(--text-muted)]">
          <span>
            {now.fixedPct}% {tools.mixSliderQuiet}
          </span>
          <span>
            {now.variablePct}% {tools.mixSliderSwing}
          </span>
        </span>
      </label>
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--background)]">
        <div className="flex h-full w-full">
          <div className="h-full bg-[var(--text)]" style={{ width: `${now.fixedPct}%` }} />
          <div className="h-full bg-[var(--primary)]" style={{ width: `${now.variablePct}%` }} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-sm text-[var(--text-muted)]">{tools.mixNowQuiet}</p>
          <p className="mt-1 font-display text-2xl tabular-nums">{fmt(now.fixedAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--text-muted)]">{tools.mixNowSwing}</p>
          <p className="mt-1 font-display text-2xl tabular-nums text-[var(--primary)]">
            {fmt(now.variableAmount)}
          </p>
        </div>
      </div>
      {month.fixedAmount > 0 || month.variableAmount > 0 ? (
        <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
          {fill(tools.mixMonthlyLine, {
            fixed: fmt(month.fixedAmount),
            variable: fmt(month.variableAmount),
          })}
        </p>
      ) : null}
      <ul className="space-y-3">
        {rows.map((row) => {
          const expanded = open === row.key;
          return (
            <li key={row.key}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : row.key)}
                className={`w-full rounded-2xl border border-[var(--border)] p-4 text-left shadow-[var(--elevation-sm)] transition-colors sm:p-5 ${CARD[row.key]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-lg leading-snug sm:text-xl">{GROUP[row.key]}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">
                      {GROUP_LEAD[row.key]}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {row.percentage}% · {expanded ? tools.allocClose : tools.allocOpen}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="tabular-nums text-base sm:text-lg">{fmt(row.amount)}</p>
                    <span
                      className={`mt-0.5 inline-block text-[var(--text-muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
                      aria-hidden
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--background)]/80">
                  <div className={`h-full ${BAR[row.key]}`} style={{ width: `${row.percentage}%` }} />
                </div>
                {expanded ? (
                  <ul className="mt-4 space-y-3 border-t border-[var(--border)]/80 pt-4">
                    {PART[row.key].map((part) => (
                      <li key={part.key}>
                        <div className="flex items-baseline justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-[var(--text)] sm:text-base">{part.label}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
                              {part.hint}
                            </p>
                          </div>
                          <p className="shrink-0 tabular-nums text-sm sm:text-base">{fmt(row.amount)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)]">{tools.mixNote}</p>
    </div>
  );
}
