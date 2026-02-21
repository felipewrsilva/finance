"use client";

import { toggleTransactionType } from "@/modules/user-settings/actions";
import { useTranslations } from "next-intl";
import type { TransactionType } from "@prisma/client";

const TYPE_CONFIG: {
  type: TransactionType;
  activeColor: string;
  icon: string;
}[] = [
  { type: "EXPENSE", activeColor: "border-red-200 bg-red-50 text-red-700", icon: "↓" },
  { type: "INCOME", activeColor: "border-green-200 bg-green-50 text-green-700", icon: "↑" },
  { type: "TRANSFER", activeColor: "border-indigo-200 bg-indigo-50 text-indigo-700", icon: "⇄" },
  { type: "INVESTMENT", activeColor: "border-violet-200 bg-violet-50 text-violet-700", icon: "📈" },
];

interface TransactionTypeSettingsProps {
  enabledTypes: TransactionType[];
}

export function TransactionTypeSettings({ enabledTypes }: TransactionTypeSettingsProps) {
  const t = useTranslations("form");
  const ts = useTranslations("settings");

  function label(type: TransactionType) {
    if (type === "EXPENSE") return t("expense");
    if (type === "INCOME") return t("income");
    if (type === "TRANSFER") return t("transfer");
    return t("investment");
  }

  const REQUIRED: TransactionType[] = ["INCOME", "EXPENSE"];
  const isOnlyEnabled = enabledTypes.filter((t) => !REQUIRED.includes(t)).length === 0
    && enabledTypes.length === 1;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {TYPE_CONFIG.map(({ type, activeColor, icon }, i) => {
          const required = REQUIRED.includes(type);
          const enabled = required || enabledTypes.includes(type);
          const isLast = i === TYPE_CONFIG.length - 1;
          const disabled = required || (enabled && isOnlyEnabled);

          return (
            <form key={type} action={toggleTransactionType.bind(null, type)}>
              <button
                type="submit"
                disabled={disabled}
                title={required ? ts("transactionTypesRequired") : disabled ? ts("transactionTypesAtLeastOne") : undefined}
                className={`flex w-full items-center gap-4 px-4 py-3.5 transition-colors ${
                  !isLast ? "border-b border-gray-50" : ""
                } ${
                  disabled
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-gray-50/70 active:bg-gray-100/60"
                }`}
              >
                {/* Type icon badge */}
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-semibold border ${
                    enabled ? activeColor : "border-gray-200 bg-gray-100 text-gray-400"
                  }`}
                >
                  {icon}
                </span>

                {/* Label */}
                <span
                  className={`flex-1 text-sm font-medium ${
                    enabled ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {label(type)}
                </span>

                {/* Toggle switch */}
                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
                    enabled ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      enabled ? "translate-x-4" : ""
                    }`}
                  />
                </span>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
