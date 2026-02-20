import { auth } from "@/auth";
import { getBudgets } from "@/modules/budgets/actions";
import BudgetList from "@/components/budgets/budget-list";

export default async function BudgetsPage() {
  const now = new Date();
  const [session, budgets] = await Promise.all([
    auth(),
    getBudgets(now.getMonth() + 1, now.getFullYear()),
  ]);

  const currency = session?.user?.defaultCurrency ?? "BRL";
  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Budgets</h1>
          <p className="text-sm text-gray-500">{monthLabel}</p>
        </div>
        <a
          href="/dashboard/budgets/new"
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + New budget
        </a>
      </div>

      <BudgetList budgets={budgets} currency={currency} />
    </div>
  );
}
