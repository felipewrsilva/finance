"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
      className={`inline-flex min-h-[44px] items-center rounded-full px-3.5 py-2 text-sm font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 sm:min-h-0 sm:py-1.5 ${
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

      {/* Filter chips */}
      <div className="space-y-3 md:space-y-0 md:flex md:flex-wrap md:items-center md:gap-x-1 md:gap-y-2">
        {/* Type group */}
        <div className="space-y-1.5 md:space-y-0" role="group" aria-label="Transaction type">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 md:hidden">
            Type
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip label="All" active={activeType === ""} onClick={() => update("type", "")} />
            <Chip
              label="Expense"
              active={activeType === "EXPENSE"}
              onClick={() => update("type", activeType === "EXPENSE" ? "" : "EXPENSE")}
            />
            <Chip
              label="Income"
              active={activeType === "INCOME"}
              onClick={() => update("type", activeType === "INCOME" ? "" : "INCOME")}
            />
          </div>
        </div>

        <span className="hidden md:inline-block h-4 w-px self-center bg-gray-200 mx-1" aria-hidden="true" />

        {/* Status group */}
        <div className="space-y-1.5 md:space-y-0" role="group" aria-label="Payment status">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 md:hidden">
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip
              label="Paid"
              active={activeStatus === "PAID"}
              onClick={() => update("status", activeStatus === "PAID" ? "" : "PAID")}
            />
            <Chip
              label="Pending"
              active={activeStatus === "PENDING"}
              onClick={() => update("status", activeStatus === "PENDING" ? "" : "PENDING")}
            />
          </div>
        </div>

        {/* Account chips — only when multiple accounts */}
        {shouldRenderSelector(accounts) && (
          <>
            <span className="hidden md:inline-block h-4 w-px self-center bg-gray-200 mx-1" aria-hidden="true" />
            <div className="space-y-1.5 md:space-y-0" role="group" aria-label="Account">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 md:hidden">
                Account
              </p>
              {/* Horizontal scroll on mobile so chips never wrap to multiple lines */}
              <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible md:pb-0">
                <Chip
                  label="All"
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
  );
}

