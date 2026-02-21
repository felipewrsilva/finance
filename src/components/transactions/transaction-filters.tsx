"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MonthNavigator } from "@/components/ui/month-navigator";
import { shouldRenderSelector } from "@/lib/utils";
import type { Account } from "@prisma/client";

interface TransactionFiltersProps {
  accounts: Account[];
  currentMonth: number;
  currentYear: number;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

export function TransactionFilters({
  accounts,
  currentMonth,
  currentYear,
}: TransactionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const t = useTranslations("transactions");
  const tc = useTranslations("common");

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  const activeType = params.get("type") ?? "";
  const activeStatus = params.get("status") ?? "";
  const activeAccount = params.get("accountId") ?? "";

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <MonthNavigator month={currentMonth} year={currentYear} />

      {/* Filter groups */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
          {/* Type group */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              {t("type")}
            </p>
            <div className="flex gap-1.5">
              <Chip label={tc("all")} active={activeType === ""} onClick={() => update("type", "")} />
              <Chip
                label={tc("expense")}
                active={activeType === "EXPENSE"}
                onClick={() => update("type", activeType === "EXPENSE" ? "" : "EXPENSE")}
              />
              <Chip
                label={tc("income")}
                active={activeType === "INCOME"}
                onClick={() => update("type", activeType === "INCOME" ? "" : "INCOME")}
              />
              <Chip
                label={tc("investment")}
                active={activeType === "INVESTMENT"}
                onClick={() => update("type", activeType === "INVESTMENT" ? "" : "INVESTMENT")}
              />
            </div>
          </div>

          <div className="hidden h-8 w-px self-center bg-gray-100 sm:block" aria-hidden="true" />

          {/* Status group */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              {t("status")}
            </p>
            <div className="flex gap-1.5">
              <Chip
                label={tc("paid")}
                active={activeStatus === "PAID"}
                onClick={() => update("status", activeStatus === "PAID" ? "" : "PAID")}
              />
              <Chip
                label={tc("pending")}
                active={activeStatus === "PENDING"}
                onClick={() => update("status", activeStatus === "PENDING" ? "" : "PENDING")}
              />
            </div>
          </div>

          {/* Account chips — only when multiple accounts */}
          {shouldRenderSelector(accounts) && (
            <>
              <div className="hidden h-8 w-px self-center bg-gray-100 sm:block" aria-hidden="true" />
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  {t("account")}
                </p>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0">
                  <Chip
                    label={tc("all")}
                    active={activeAccount === ""}
                    onClick={() => update("accountId", "")}
                  />
                  {accounts.map((a) => (
                    <Chip
                      key={a.id}
                      label={a.name}
                      active={activeAccount === a.id}
                      onClick={() => update("accountId", activeAccount === a.id ? "" : a.id)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
