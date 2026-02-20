"use client";

import { useTranslations } from "next-intl";

interface TypeToggleProps {
  value: "INCOME" | "EXPENSE" | "TRANSFER";
  onChange: (value: "INCOME" | "EXPENSE" | "TRANSFER") => void;
}

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  const t = useTranslations("form");
  return (
    <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
      {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((type) => (
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
                : "bg-white shadow-sm text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {type === "EXPENSE" ? t("expense") : type === "INCOME" ? t("income") : t("transfer")}
        </button>
      ))}
    </div>
  );
}
