"use client";

import { useState } from "react";
import { fill, tools } from "@/lib/copy";
import { MoneyField } from "@/components/tools/money-field";

export function RateNote({
  rate,
  onRateChange,
}: {
  rate: number;
  onRateChange: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-[var(--text-muted)] underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--text)]"
      >
        {open ? tools.hideRate : tools.showRate}
      </button>
      {open ? (
        <div className="mt-4">
          <MoneyField
            label={tools.annualRate}
            hint={tools.rateHint}
            value={rate}
            onChange={onRateChange}
            step={0.1}
            quiet
          />
        </div>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {fill(tools.rateQuiet, {
            rate: rate.toLocaleString("pt-BR", { maximumFractionDigits: 2 }),
          })}
        </p>
      )}
    </div>
  );
}
