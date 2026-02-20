"use client";

import Link from "next/link";
import { deleteTransaction } from "@/modules/transactions/actions";
import { TRANSACTION_TYPE_COLORS } from "@/modules/transactions/constants";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import { formatCurrency } from "@/lib/utils";
import type { Transaction, Account, Category } from "@prisma/client";

type TransactionWithRels = Transaction & { account: Account; category: Category };

interface TransactionListProps {
  transactions: TransactionWithRels[];
  currency?: string;
}

export function TransactionList({ transactions, currency = "BRL" }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
        <p className="text-4xl mb-2">💸</p>
        <p className="font-medium">No transactions this month</p>
        <p className="text-sm mt-1">Add your first transaction to get started.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {transactions.map((tx) => (
        <li
          key={tx.id}
          className="flex items-center rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
        >
          {/* Clickable row — takes up all space except delete button */}
          <Link
            href={`/dashboard/transactions/${tx.id}/edit`}
            className="flex flex-1 items-center gap-3 p-4 min-w-0 active:bg-gray-50"
          >
            {/* Category icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl shrink-0">
              {tx.category.icon ?? "📌"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-gray-900 truncate">
                  {tx.description || tx.category.name}
                </p>
                {tx.isRecurring && (
                  <span
                    title="Recurring"
                    className="text-xs shrink-0 rounded-full bg-indigo-50 px-1.5 py-0.5 text-indigo-500 font-medium"
                  >
                    🔄
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate">
                {tx.account.name} ·{" "}
                {new Date(tx.date).toLocaleDateString("pt-BR")} ·{" "}
                <span className={tx.status === "PENDING" ? "text-amber-500" : ""}>
                  {tx.status === "PENDING" ? "Pending" : "Paid"}
                </span>
              </p>
            </div>

            {/* Amount */}
            <span
              className={`font-semibold shrink-0 ${TRANSACTION_TYPE_COLORS[tx.type]}`}
            >
              {tx.type === "EXPENSE" ? "-" : "+"}
              {formatCurrency(Number(tx.amount), currency)}
            </span>
          </Link>

          {/* Delete — outside Link to avoid click propagation */}
          <div className="pr-3 shrink-0">
            <InlineConfirmButton onConfirm={() => deleteTransaction(tx.id)} />
          </div>
        </li>
      ))}
    </ul>
  );
}

