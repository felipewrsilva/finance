"use client";

import { useRouter } from "next/navigation";
import { createTransaction, updateTransaction } from "@/modules/transactions/actions";
import { TRANSACTION_TYPE_LABELS, TRANSACTION_STATUS_LABELS } from "@/modules/transactions/constants";
import type { Account, Category, Transaction, TransactionType } from "@prisma/client";

interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
  transaction?: Transaction;
  defaultType?: TransactionType;
}

export function TransactionForm({ accounts, categories, transaction, defaultType = "EXPENSE" }: TransactionFormProps) {
  const router = useRouter();

  const action = transaction
    ? updateTransaction.bind(null, transaction.id)
    : createTransaction;

  const todayStr = new Date().toISOString().split("T")[0];
  const txDate = transaction
    ? new Date(transaction.date).toISOString().split("T")[0]
    : todayStr;

  const currentType = (transaction?.type ?? defaultType) as TransactionType;
  const filteredCategories = categories.filter((c) => c.type === currentType || c.type === "INCOME" || c.type === "EXPENSE");

  return (
    <form action={action} className="space-y-5">
      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          name="type"
          defaultValue={currentType}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {(["INCOME", "EXPENSE"] as TransactionType[]).map((t) => (
            <option key={t} value={t}>{TRANSACTION_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={transaction ? String(transaction.amount) : ""}
          placeholder="0.00"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Account */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
        <select
          name="accountId"
          defaultValue={transaction?.accountId ?? ""}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select an account</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          name="categoryId"
          defaultValue={transaction?.categoryId ?? ""}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a category</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon ? `${c.icon} ` : ""}{c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          name="date"
          type="date"
          defaultValue={txDate}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          defaultValue={transaction?.status ?? "PAID"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {Object.entries(TRANSACTION_STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          name="description"
          type="text"
          defaultValue={transaction?.description ?? ""}
          placeholder="Optional note"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {transaction ? "Save changes" : "Add transaction"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
