"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoneyField } from "@/components/tools/money-field";

export function RateNote({
  rate,
  onRateChange,
}: {
  rate: number;
  onRateChange: (n: number) => void;
}) {
  const t = useTranslations("tools");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-[var(--text-muted)] underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--text)]"
      >
        {open ? t("hideRate") : t("showRate")}
      </button>
      {open ? (
        <div className="mt-4">
          <MoneyField
            label={t("annualRate")}
            hint={t("rateHint")}
            value={rate}
            onChange={onRateChange}
            step={0.1}
            quiet
          />
        </div>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t("rateQuiet", { rate })}</p>
      )}
    </div>
  );
}
