import { getInvestmentCategories } from "@/modules/investments/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import { InvestmentForm } from "@/components/investments/investment-form";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function NewInvestmentPage({ params }: Props) {
  const { locale } = await params;
  const [categories, currencyPrefs, t] = await Promise.all([
    getInvestmentCategories(),
    getUserCurrencies(),
    getTranslations("investments"),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("addInvestment")}</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <InvestmentForm
          categories={categories}
          userCurrencies={currencyPrefs.currencies}
          defaultCurrency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale ?? locale}
        />
      </div>
    </div>
  );
}
