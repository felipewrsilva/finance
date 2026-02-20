import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { getTransactions } from "@/modules/transactions/actions";
import { getAccounts } from "@/modules/accounts/actions";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { formatCurrency } from "@/lib/utils";
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

  const [session, transactions, accounts] = await Promise.all([
    auth(),
    getTransactions({
      month,
      year,
      type: sp.type as TransactionType | undefined,
      accountId: sp.accountId,
      status: sp.status as TransactionStatus | undefined,
    }),
    getAccounts(),
  ]);

  const currency = session?.user?.defaultCurrency ?? "BRL";
  const locale = session?.user?.locale ?? "pt-BR";

  const income = transactions
    .filter((t) => t.type === "INCOME" && t.status === "PAID")
    .reduce((s, t) => s + Number(t.amountInDefaultCurrency), 0);

  const expense = transactions
    .filter((t) => t.type === "EXPENSE" && t.status === "PAID")
    .reduce((s, t) => s + Number(t.amountInDefaultCurrency), 0);

  const net = income - expense;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
        <div className="flex items-center gap-2">
          <a
            href={`/api/export/transactions?month=${month}&year=${year}`}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Export CSV
          </a>
          <Link
            href="/dashboard/transactions/new"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 lg:px-5 lg:py-3"
          >
            + Add
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <section aria-label="Monthly summary" className="grid grid-cols-3 gap-3 lg:gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <p className="text-xs font-medium text-gray-400">Income</p>
          <p className="mt-1 text-lg font-bold text-green-600 lg:text-xl">
            {formatCurrency(income, currency, locale)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <p className="text-xs font-medium text-gray-400">Expenses</p>
          <p className="mt-1 text-lg font-bold text-red-500 lg:text-xl">
            {formatCurrency(expense, currency, locale)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <p className="text-xs font-medium text-gray-400">Balance</p>
          <p className={`mt-1 text-lg font-bold lg:text-xl ${net >= 0 ? "text-indigo-600" : "text-red-500"}`}>
            {formatCurrency(net, currency, locale)}
          </p>
        </div>
      </section>

      {/* Filters */}
      <Suspense>
        <TransactionFilters
          accounts={accounts}
          currentMonth={month}
          currentYear={year}
        />
      </Suspense>

      {/* List */}
      <TransactionList transactions={transactions} currency={currency} locale={locale} />
    </div>
  );
}

