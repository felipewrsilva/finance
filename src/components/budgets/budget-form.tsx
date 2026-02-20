"use client";

import { useRouter } from "next/navigation";
import { BudgetPeriod } from "@prisma/client";
import { createBudget, updateBudget } from "@/modules/budgets/actions";
import { BUDGET_PERIOD_LABELS } from "@/modules/budgets/constants";
import type { Category, Budget } from "@prisma/client";

interface Props {
  budget?: Budget & { category: Category | null };
  categories: Category[];
}

export default function BudgetForm({ budget, categories }: Props) {
  const router = useRouter();

  const action = budget
    ? updateBudget.bind(null, budget.id)
    : createBudget;

  const fmt = (d: Date) => new Date(d).toISOString().split("T")[0];

  return (
    <form action={action} className="space-y-4">
      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
        <input
          name="name"
          defaultValue={budget?.name ?? ""}
          placeholder="e.g. Monthly food budget"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          required
        />
      </div>

      {/* Category (optional) */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Category <span className="text-gray-400">(optional)</span>
        </label>
        <select
          name="categoryId"
          defaultValue={budget?.categoryId ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All expense categories</option>
          {categories
            .filter((c) => c.type === "EXPENSE")
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Budget amount</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={budget ? Number(budget.amount) : ""}
          placeholder="0.00"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          required
        />
      </div>

      {/* Period */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Period</label>
        <select
          name="period"
          defaultValue={budget?.period ?? "MONTHLY"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          {Object.entries(BUDGET_PERIOD_LABELS).map(([val, label]) => (
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
          defaultValue={budget ? fmt(budget.startDate) : fmt(new Date())}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          required
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
          defaultValue={budget?.endDate ? fmt(budget.endDate) : ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {budget ? "Save changes" : "Create budget"}
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
