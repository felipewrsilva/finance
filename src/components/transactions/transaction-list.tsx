"use client";

import { deleteTransaction } from "@/modules/transactions/actions";
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLORS,
  TRANSACTION_STATUS_LABELS,
} from "@/modules/transactions/constants";
import type { Transaction, Account, Category } from "@prisma/client";
import Link from "next/link";

type TransactionWithRels = Transaction & { account: Account; category: Category };

interface TransactionListProps {
  transactions: TransactionWithRels[];
}

export function TransactionList({ transactions }: TransactionListProps) {
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
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          {/* Category icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl shrink-0">
            {tx.category.icon ?? "📌"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {tx.description || tx.category.name}
            </p>
            <p className="text-xs text-gray-400">
              {tx.account.name} · {new Date(tx.date).toLocaleDateString()} ·{" "}
              <span
                className={
                  tx.status === "PENDING" ? "text-amber-500" : "text-gray-400"
                }
              >
                {TRANSACTION_STATUS_LABELS[tx.status]}
              </span>
            </p>
          </div>

          {/* Amount */}
          <span className={`font-semibold ${TRANSACTION_TYPE_COLORS[tx.type]}`}>
            {tx.type === "EXPENSE" ? "-" : "+"}
            {Number(tx.amount).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </span>

          {/* Edit */}
          <Link
            href={`/dashboard/transactions/${tx.id}/edit`}
            className="ml-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
          >
            Edit
          </Link>

          {/* Delete */}
          <button
            onClick={() => deleteTransaction(tx.id)}
            className="rounded-lg border border-red-100 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
