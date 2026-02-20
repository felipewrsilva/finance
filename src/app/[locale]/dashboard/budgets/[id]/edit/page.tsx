import { notFound } from "next/navigation";
import { getBudget } from "@/modules/budgets/actions";
import { getCategories } from "@/modules/categories/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import BudgetForm from "@/components/budgets/budget-form";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ id: string }> };

export default async function EditBudgetPage({ params }: Props) {
  const { id } = await params;
  const [budget, categories, currencyPrefs, t] = await Promise.all([
    getBudget(id),
    getCategories(),
    getUserCurrencies(),
    getTranslations("budgets"),
  ]);

  if (!budget) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t("editTitle")}</h1>
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
