"use client";

import { deleteRecurringRule, toggleRecurringRule } from "@/modules/recurring/actions";
import { FREQUENCY_LABELS } from "@/modules/recurring/constants";
import type { RecurringRuleView } from "@/modules/recurring/actions";
import type { TransactionType } from "@prisma/client";

interface Props {
  rules: RecurringRuleView[];
  currency: string;
}

export default function RecurringList({ rules, currency }: Props) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(v);

  if (rules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        No recurring rules yet.{" "}
        <a href="/dashboard/recurring/new" className="font-medium text-indigo-600 hover:underline">
          Create one →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map((r) => {
        const typeColor: Record<TransactionType, string> = {
          INCOME: "text-green-600",
          EXPENSE: "text-red-500",
          TRANSFER: "text-blue-500",
        };

        return (
          <div
            key={r.id}
            className={`rounded-xl border bg-white p-4 shadow-sm ${r.isActive ? "border-gray-100" : "border-dashed border-gray-200 opacity-60"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{r.categoryIcon ?? "🔄"}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {r.templateData.description ?? r.categoryName ?? "Recurring"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {r.accountName} · {FREQUENCY_LABELS[r.frequency]}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-sm font-bold ${typeColor[r.templateData.type]}`}>
                  {r.templateData.type === "INCOME" ? "+" : "-"}
                  {fmt(r.templateData.amount)}
                </p>
                <p className="text-xs text-gray-400">
                  from {new Date(r.startDate).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                  {r.endDate
                    ? ` to ${new Date(r.endDate).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              {/* Toggle active */}
              <form action={async () => { await toggleRecurringRule(r.id, !r.isActive); }}>
                <button
                  type="submit"
                  className={`rounded-lg border px-2 py-1 text-xs ${
                    r.isActive
                      ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                      : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                >
                  {r.isActive ? "Pause" : "Resume"}
                </button>
              </form>

              <a
                href={`/dashboard/recurring/${r.id}/edit`}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
              >
                Edit
              </a>

              <form action={async () => { await deleteRecurringRule(r.id); }}>
                <button
                  type="submit"
                  className="rounded-lg border border-red-100 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                  onClick={(e) => {
                    if (!confirm("Delete this rule?")) e.preventDefault();
                  }}
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
