import { auth } from "@/auth";
import {
  getRecurringRules,
  generateRecurringTransactions,
} from "@/modules/recurring/actions";
import RecurringList from "@/components/recurring/recurring-list";

export default async function RecurringPage() {
  const now = new Date();
  const [session, rules] = await Promise.all([
    auth(),
    getRecurringRules(),
  ]);

  const currency = session?.user?.currency ?? "BRL";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recurring transactions</h1>
          <p className="text-sm text-gray-500">Automate your regular income & expenses.</p>
        </div>
        <a
          href="/dashboard/recurring/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New rule
        </a>
      </div>

      {/* Generate button */}
      {rules.some((r) => r.isActive) && (
        <form
          action={async () => {
            "use server";
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            await generateRecurringTransactions(month, year);
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl border border-dashed border-indigo-300 bg-indigo-50 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            ⚡ Generate pending transactions for{" "}
            {now.toLocaleString("default", { month: "long", year: "numeric" })}
          </button>
        </form>
      )}

      <RecurringList rules={rules} currency={currency} />
    </div>
  );
}
