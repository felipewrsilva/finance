import { getCategories } from "@/modules/categories/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import BudgetForm from "@/components/budgets/budget-form";
import { getTranslations } from "next-intl/server";

export default async function NewBudgetPage() {
  const [categories, currencyPrefs, t] = await Promise.all([
    getCategories(),
    getUserCurrencies(),
    getTranslations("budgets"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t("newTitle")}</h1>
        <p className="text-sm text-gray-500">{t("newSubtitle")}</p>
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
