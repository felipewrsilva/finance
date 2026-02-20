"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTransaction, updateTransaction } from "@/modules/transactions/actions";
import { TRANSACTION_STATUS_LABELS } from "@/modules/transactions/constants";
import { TypeToggle } from "@/components/ui/type-toggle";
import { RecurringSection } from "@/components/ui/recurring-section";
import { shouldRenderSelector } from "@/lib/utils";
import type { Account, Category, Transaction } from "@prisma/client";

interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
  transaction?: Transaction;
  defaultType?: "INCOME" | "EXPENSE";
}

export function TransactionForm({
  accounts,
  categories,
  transaction,
  defaultType = "EXPENSE",
}: TransactionFormProps) {
  const router = useRouter();

  const [type, setType] = useState<"INCOME" | "EXPENSE">(
    (transaction?.type as "INCOME" | "EXPENSE") ?? defaultType
  );
  const [accountId, setAccountId] = useState(
    transaction?.accountId ?? (accounts.length === 1 ? accounts[0].id : "")
  );
  const [status, setStatus] = useState<"PAID" | "PENDING">(
    transaction?.status ?? "PAID"
  );

  // Load persisted preferences only for new transactions
  useEffect(() => {
    if (!transaction) {
      const savedType = localStorage.getItem("lastTxType") as "INCOME" | "EXPENSE" | null;
      if (savedType === "INCOME" || savedType === "EXPENSE") setType(savedType);

      const savedAccountId = localStorage.getItem("lastTxAccountId");
      if (savedAccountId && accounts.some((a) => a.id === savedAccountId)) {
        setAccountId(savedAccountId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTypeChange(newType: "INCOME" | "EXPENSE") {
    setType(newType);
    localStorage.setItem("lastTxType", newType);
  }

  function handleAccountChange(id: string) {
    setAccountId(id);
    localStorage.setItem("lastTxAccountId", id);
  }

  const action = transaction
    ? updateTransaction.bind(null, transaction.id)
    : createTransaction;

  const txDate = transaction
    ? new Date(transaction.date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const filteredCategories = categories.filter((c) => c.type === type);
  const showAccountSelector = shouldRenderSelector(accounts);

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <form action={action} className="space-y-5">
      {/* Controlled hidden inputs for server action */}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="accountId" value={accountId || (accounts[0]?.id ?? "")} />
      <input type="hidden" name="status" value={status} />

      {/* Type — segmented control */}
      <TypeToggle value={type} onChange={handleTypeChange} />

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
          className={inputCls}
        />
      </div>

      {/* Account — only when multiple accounts exist */}
      {showAccountSelector && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
          <select
            value={accountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            required
            className={inputCls}
          >
            <option value="">Select an account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category — auto-select when only one option */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        {filteredCategories.length === 1 ? (
          <>
            <input type="hidden" name="categoryId" value={filteredCategories[0].id} />
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {filteredCategories[0].icon && (
                <span>{filteredCategories[0].icon}</span>
              )}
              <span>{filteredCategories[0].name}</span>
              <span className="ml-auto text-xs text-gray-400">Auto-selected</span>
            </div>
          </>
        ) : (
          <select
            name="categoryId"
            defaultValue={transaction?.categoryId ?? ""}
            required
            className={inputCls}
          >
            <option value="">Select a category</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          name="date"
          type="date"
          defaultValue={txDate}
          required
          className={inputCls}
        />
      </div>

      {/* Status — segmented control */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
          {(["PAID", "PENDING"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
                status === s
                  ? s === "PAID"
                    ? "bg-white shadow-sm text-green-600"
                    : "bg-white shadow-sm text-amber-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {TRANSACTION_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          name="description"
          type="text"
          defaultValue={transaction?.description ?? ""}
          placeholder="e.g. Netflix subscription"
          className={inputCls}
        />
      </div>

      {/* Recurring section */}
      <RecurringSection
        defaultIsRecurring={transaction?.isRecurring ?? false}
        defaultFrequency={transaction?.frequency ?? "MONTHLY"}
        defaultRecurrenceEnd={transaction?.recurrenceEnd ?? null}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800"
        >
          {transaction ? "Save changes" : "Add transaction"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

