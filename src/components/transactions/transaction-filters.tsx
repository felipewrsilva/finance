"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MONTHS } from "@/modules/transactions/constants";
import { TRANSACTION_TYPE_LABELS } from "@/modules/transactions/constants";
import type { Account, TransactionType } from "@prisma/client";

interface TransactionFiltersProps {
  accounts: Account[];
  currentMonth: number;
  currentYear: number;
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

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="flex flex-wrap gap-3">
      {/* Month */}
      <select
        value={currentMonth}
        onChange={(e) => update("month", e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {MONTHS.map((m, i) => (
          <option key={m} value={i + 1}>{m}</option>
        ))}
      </select>

      {/* Year */}
      <select
        value={currentYear}
        onChange={(e) => update("year", e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Type */}
      <select
        value={params.get("type") ?? ""}
        onChange={(e) => update("type", e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All types</option>
        {(["INCOME", "EXPENSE"] as TransactionType[]).map((t) => (
          <option key={t} value={t}>{TRANSACTION_TYPE_LABELS[t]}</option>
        ))}
      </select>

      {/* Account */}
      <select
        value={params.get("accountId") ?? ""}
        onChange={(e) => update("accountId", e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All accounts</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={params.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All statuses</option>
        <option value="PAID">Paid</option>
        <option value="PENDING">Pending</option>
      </select>
    </div>
  );
}
