"use client";

import { useRouter } from "next/navigation";
import { Frequency, TransactionType } from "@prisma/client";
import { createRecurringRule, updateRecurringRule } from "@/modules/recurring/actions";
import { FREQUENCY_LABELS } from "@/modules/recurring/constants";
import { TRANSACTION_TYPE_LABELS } from "@/modules/transactions/constants";
import type { Account, Category, RecurringRule } from "@prisma/client";

interface Props {
  rule?: RecurringRule;
  accounts: Account[];
  categories: Category[];
}

export default function RecurringForm({ rule, accounts, categories }: Props) {
  const router = useRouter();

  const action = rule ? updateRecurringRule.bind(null, rule.id) : createRecurringRule;
  const td = rule?.templateData as
    | {
        accountId: string;
        categoryId: string;
        type: TransactionType;
        amount: number;
        description?: string;
      }
    | undefined;

  const fmt = (d: Date) => new Date(d).toISOString().split("T")[0];

  return (
    <form action={action} className="space-y-4">
      {/* Type */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
        <select
          name="type"
          defaultValue={td?.type ?? "EXPENSE"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          {Object.entries(TRANSACTION_TYPE_LABELS)
            .filter(([v]) => v !== "TRANSFER")
            .map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
        </select>
      </div>

      {/* Account */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Account</label>
        <select
          name="accountId"
          defaultValue={td?.accountId ?? ""}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Select account</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
        <select
          name="categoryId"
          defaultValue={td?.categoryId ?? ""}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Amount</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={td?.amount ?? ""}
          placeholder="0.00"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <input
          name="description"
          defaultValue={td?.description ?? ""}
          placeholder="e.g. Netflix subscription"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Frequency */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Frequency</label>
        <select
          name="frequency"
          defaultValue={rule?.frequency ?? "MONTHLY"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          {Object.entries(FREQUENCY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Start date */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Start date</label>
        <input
          name="startDate"
          type="date"
          defaultValue={rule ? fmt(rule.startDate) : fmt(new Date())}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* End date */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          End date <span className="text-gray-400">(optional)</span>
        </label>
        <input
          name="endDate"
          type="date"
          defaultValue={rule?.endDate ? fmt(rule.endDate) : ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {rule ? "Save changes" : "Create rule"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
