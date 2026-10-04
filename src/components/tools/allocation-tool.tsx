"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { allocateIncome, type AllocationGroupKey } from "@/lib/tools-math";
import { tools } from "@/lib/copy";
import { MoneyField } from "@/components/tools/money-field";

const GROUP: Record<AllocationGroupKey, string> = {
  fixed: tools.alloc_fixed,
  comfort: tools.alloc_comfort,
  goals: tools.alloc_goals,
  investments: tools.alloc_investments,
};

const PART: Record<string, { label: string; hint: string }> = {
  housing: { label: tools.part_housing, hint: tools.part_housingHint },
  utilities: { label: tools.part_utilities, hint: tools.part_utilitiesHint },
  groceries: { label: tools.part_groceries, hint: tools.part_groceriesHint },
  transport: { label: tools.part_transport, hint: tools.part_transportHint },
  out: { label: tools.part_out, hint: tools.part_outHint },
  small: { label: tools.part_small, hint: tools.part_smallHint },
  reserve: { label: tools.part_reserve, hint: tools.part_reserveHint },
  wish: { label: tools.part_wish, hint: tools.part_wishHint },
  grow: { label: tools.part_grow, hint: tools.part_growHint },
};

const BAR: Record<AllocationGroupKey, string> = {
  fixed: "bg-[var(--text)]",
  comfort: "bg-[var(--primary)]",
  goals: "bg-[var(--warning)]",
  investments: "bg-[var(--success)]",
};

const CARD: Record<AllocationGroupKey, string> = {
  fixed: "bg-[var(--surface)]",
  comfort: "bg-[var(--surface)]",
  goals: "bg-[var(--warning-subtle)]",
  investments: "bg-[var(--success-subtle)]",
};

export function AllocationTool() {
  const [income, setIncome] = useState(3000);
  const [open, setOpen] = useState<AllocationGroupKey | null>("fixed");
  const rows = useMemo(() => allocateIncome(Number(income) || 0), [income]);
  const fmt = (v: number) => formatCurrency(v, "BRL", "pt-BR");

  return (
    <div className="space-y-8 sm:space-y-10">
      <MoneyField
        label={tools.monthlyIncome}
        value={income}
        onChange={setIncome}
        step={50}
        prefix="R$"
      />
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">{tools.allocHint}</p>
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
                    {row.parts.map((part) => (
                      <li key={part.key}>
                        <div className="flex items-baseline justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-[var(--text)] sm:text-base">{PART[part.key].label}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
                              {PART[part.key].hint}
                            </p>
                          </div>
                          <p className="shrink-0 tabular-nums text-sm sm:text-base">{fmt(part.amount)}</p>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--background)]/80">
                          <div
                            className={`h-full ${BAR[row.key]} opacity-70`}
                            style={{ width: `${part.ofGroupPct}%` }}
                          />
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
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)]">{tools.allocNote}</p>
    </div>
  );
}
