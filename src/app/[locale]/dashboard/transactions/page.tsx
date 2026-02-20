import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { getTransactions } from "@/modules/transactions/actions";
import { getAccounts } from "@/modules/accounts/actions";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/utils";
import type { TransactionType, TransactionStatus } from "@prisma/client";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    month?: string;
    year?: string;
    type?: string;
    accountId?: string;
    status?: string;
  }>;
}

export default async function TransactionsPage({ params, searchParams }: PageProps) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const now = new Date();
  const month = Number(sp.month) || now.getMonth() + 1;
  const year = Number(sp.year) || now.getFullYear();

  const [session, transactions, accounts, t] = await Promise.all([
    auth(),
    getTransactions({
      month,
      year,
      type: sp.type as TransactionType | undefined,
      accountId: sp.accountId,
      status: sp.status as TransactionStatus | undefined,
    }),
    getAccounts(),
    getTranslations("transactions"),
  ]);

  const currency = session?.user?.defaultCurrency ?? "BRL";
  const userLocale = session?.user?.locale ?? locale;

  const income = transactions
    .filter((t) => t.type === "INCOME" && t.status === "PAID")
    .reduce((s, t) => s + Number(t.amountInDefaultCurrency), 0);

  const expense = transactions
    .filter((t) => t.type === "EXPENSE" && t.status === "PAID")
    .reduce((s, t) => s + Number(t.amountInDefaultCurrency), 0);

  const net = income - expense;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <PageHeader
        title={t("title")}
        action={
          <div className="flex items-center gap-2">
            <a
              href={`/api/export/transactions?month=${month}&year=${year}`}
              className="inline-flex h-10 items-center rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {t("export")}
            </a>
            <Link
              href={`/${locale}/dashboard/transactions/new`}
              className="inline-flex h-10 items-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {t("add")}
            </Link>
          </div>
        }
      />

      {/* Financial summary — single horizontal panel */}
      <section
        aria-label="Monthly summary"
        className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { label: t("income"), value: income, className: "text-green-600" },
            { label: t("expenses"), value: expense, className: "text-red-500" },
            {
              label: t("balance"),
              value: net,
              className: net >= 0 ? "text-gray-900" : "text-red-500",
            },
          ].map(({ label, value, className }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 p-4 sm:flex-col sm:items-end sm:gap-1 sm:p-6"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {label}
              </p>
              <p className={`text-base font-semibold tabular-nums tracking-tight sm:text-2xl ${className}`}>
                {formatCurrency(value, currency, userLocale)}
              </p>
            </div>
          ))}
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

      {/* Transaction list */}
      <TransactionList
        transactions={transactions}
        currency={currency}
        locale={userLocale}
      />
    </div>
  );
}
