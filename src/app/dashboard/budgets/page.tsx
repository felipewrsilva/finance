import { auth } from "@/auth";
import { getBudgets } from "@/modules/budgets/actions";
import BudgetList from "@/components/budgets/budget-list";
import { PageHeader } from "@/components/ui/page-header";

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
      <PageHeader
        title="Budgets"
        subtitle={monthLabel}
        action={
          <a
            href="/dashboard/budgets/new"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + New budget
          </a>
        }
      />

      <BudgetList budgets={budgets} currency={currency} />
    </div>
  );
}
