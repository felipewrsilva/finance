import { notFound } from "next/navigation";
import { getBudget } from "@/modules/budgets/actions";
import { getCategories } from "@/modules/categories/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import BudgetForm from "@/components/budgets/budget-form";

export default async function EditBudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [budget, categories, currencyPrefs] = await Promise.all([
    getBudget(id),
    getCategories(),
    getUserCurrencies(),
  ]);

  if (!budget) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit budget</h1>
        <p className="text-sm text-gray-500">{budget.name}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <BudgetForm
          budget={budget}
          categories={categories}
          currency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale}
        />
      </div>
    </div>
  );
}
