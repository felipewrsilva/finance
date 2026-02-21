import { getInvestmentCategories } from "@/modules/investments/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import { InvestmentForm } from "@/components/investments/investment-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function NewInvestmentPage() {
  const [categories, currencyPrefs] = await Promise.all([
    getInvestmentCategories(),
    getUserCurrencies(),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="New Investment" />
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <InvestmentForm
          categories={categories}
          userCurrencies={currencyPrefs.currencies}
          defaultCurrency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale}
        />
      </div>
    </div>
  );
}
