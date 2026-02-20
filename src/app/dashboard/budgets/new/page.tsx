import { getCategories } from "@/modules/categories/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import BudgetForm from "@/components/budgets/budget-form";

export default async function NewBudgetPage() {
  const [categories, currencyPrefs] = await Promise.all([
    getCategories(),
    getUserCurrencies(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">New budget</h1>
        <p className="text-sm text-gray-500">Set a spending limit for a category or overall.</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <BudgetForm
          categories={categories}
          currency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale}
        />
      </div>
    </div>
  );
}
