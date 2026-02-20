import { Suspense } from "react";
import Link from "next/link";
import { getTransactions } from "@/modules/transactions/actions";
import { getAccounts } from "@/modules/accounts/actions";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import type { TransactionType, TransactionStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
    type?: string;
    accountId?: string;
    status?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const now = new Date();
  const month = Number(sp.month) || now.getMonth() + 1;
  const year = Number(sp.year) || now.getFullYear();

  const [transactions, accounts] = await Promise.all([
    getTransactions({
      month,
      year,
      type: sp.type as TransactionType | undefined,
      accountId: sp.accountId,
      status: sp.status as TransactionStatus | undefined,
    }),
    getAccounts(),
  ]);

  const income = transactions
    .filter((t) => t.type === "INCOME" && t.status === "PAID")
    .reduce((s, t) => s + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "EXPENSE" && t.status === "PAID")
    .reduce((s, t) => s + Number(t.amount), 0);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <Link
          href="/dashboard/transactions/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Add
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Income</p>
          <p className="mt-1 text-xl font-bold text-green-600">{fmt(income)}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Expenses</p>
          <p className="mt-1 text-xl font-bold text-red-500">{fmt(expense)}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Balance</p>
          <p className={`mt-1 text-xl font-bold ${income - expense >= 0 ? "text-indigo-600" : "text-red-500"}`}>
            {fmt(income - expense)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Suspense>
        <TransactionFilters
          accounts={accounts}
          currentMonth={month}
          currentYear={year}
        />
      </Suspense>

      {/* List */}
      <TransactionList transactions={transactions} />
    </div>
  );
}
