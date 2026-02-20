"use client";

import Link from "next/link";
import { deleteTransaction } from "@/modules/transactions/actions";
import { TRANSACTION_TYPE_COLORS } from "@/modules/transactions/constants";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import { MarkPaidButton } from "./mark-paid-button";
import { formatCurrency } from "@/lib/utils";
import type { Transaction, Account, Category } from "@prisma/client";

type TransactionWithRels = Transaction & { account: Account; category: Category | null };

interface TransactionListProps {
  transactions: TransactionWithRels[];
  currency?: string;
  locale?: string;
}

export function TransactionList({ transactions, currency = "BRL", locale = "pt-BR" }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
        <p className="text-4xl mb-3" aria-hidden="true">💸</p>
        <p className="font-medium text-gray-600">No transactions this month</p>
        <p className="text-sm mt-1 mb-5">Add your first transaction to get started.</p>
        <Link
          href="/dashboard/transactions/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          + Add transaction
        </Link>
      </div>
    );
  }

  return (
    <ul
      className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3"
      aria-label="Transactions"
      role="list"
    >
      {transactions.map((tx) => {
        const isPending = tx.status === "PENDING";

        return (
          <li
            key={tx.id}
            className="group flex items-center rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md"
          >
            {/* Clickable row */}
            <Link
              href={`/dashboard/transactions/${tx.id}/edit`}
              className="flex flex-1 items-center gap-3 p-4 min-w-0 transition-colors hover:bg-gray-50/60 active:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
            >
              {/* Category icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg">
                {tx.type === "TRANSFER" ? "↔️" : (tx.category?.icon ?? "📌")}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-medium text-gray-900">
                    {tx.description || tx.category?.name || (tx.type === "TRANSFER" ? "Transfer" : "Transaction")}
                  </p>
                  {tx.isRecurring && (
                    <span
                      title="Recurring"
                      className="shrink-0 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-500"
                    >
                      🔄
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="truncate">
                    {tx.account.name} · {new Date(tx.date).toLocaleDateString("pt-BR")}
                  </span>
                  {isPending && (
                    <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Amount — fixed width keeps all values right-aligned regardless of length */}
              <span
                className={`w-24 shrink-0 text-right text-sm font-semibold tabular-nums sm:w-28 ${TRANSACTION_TYPE_COLORS[tx.type]}`}
              >
                {tx.type === "EXPENSE" ? "−" : tx.type === "INCOME" ? "+" : ""}
                {formatCurrency(Number(tx.amount), currency, locale)}
              </span>
            </Link>

            {/* Mark paid — outside Link, always visible when pending */}
            {isPending && (
              <div className="shrink-0 pr-1">
                <MarkPaidButton id={tx.id} />
              </div>
            )}

            {/* Delete — icon-only, full opacity on mobile; fade in on desktop hover/focus */}
            <div className="shrink-0 pr-2 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <InlineConfirmButton onConfirm={() => deleteTransaction(tx.id)} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
