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
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all active:scale-95 ${
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

      {/* Type chips */}
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

      {/* Status chips */}
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

      {/* Account chips — only when multiple accounts */}
      {shouldRenderSelector(accounts) && (
        <div className="flex flex-wrap gap-2">
          <Chip
            label="All accounts"
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
      )}
    </div>
  );
}

