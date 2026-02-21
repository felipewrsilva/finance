"use client";

import { useTranslations } from "next-intl";

type TxType = "INCOME" | "EXPENSE" | "TRANSFER" | "INVESTMENT";

interface TypeToggleProps {
  value: TxType;
  onChange: (value: TxType) => void;
  enabledTypes?: TxType[];
}

export function TypeToggle({ value, onChange, enabledTypes }: TypeToggleProps) {
  const t = useTranslations("form");
  // Always show the current value even if globally disabled (e.g. editing old transaction)
  const all: TxType[] = ["EXPENSE", "INCOME", "TRANSFER", "INVESTMENT"];
  const visible = enabledTypes
    ? all.filter((t) => enabledTypes.includes(t) || t === value)
    : all;

  return (
    <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
      {visible.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
            value === type
              ? type === "EXPENSE"
                ? "bg-white shadow-sm text-red-600"
                : type === "INCOME"
                ? "bg-white shadow-sm text-green-600"
                : type === "INVESTMENT"
                ? "bg-white shadow-sm text-violet-600"
                : "bg-white shadow-sm text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {type === "EXPENSE"
            ? t("expense")
            : type === "INCOME"
            ? t("income")
            : type === "INVESTMENT"
            ? t("investment")
            : t("transfer")}
        </button>
      ))}
    </div>
  );
}
