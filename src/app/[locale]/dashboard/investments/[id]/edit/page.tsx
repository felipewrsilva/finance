import { notFound } from "next/navigation";
import { getInvestment, getInvestmentCategories } from "@/modules/investments/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import { InvestmentForm } from "@/components/investments/investment-form";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditInvestmentPage({ params }: PageProps) {
  const { locale, id } = await params;
  const [investment, categories, currencyPrefs, t] = await Promise.all([
    getInvestment(id),
    getInvestmentCategories(),
    getUserCurrencies(),
    getTranslations("investments"),
  ]);

  if (!investment) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {t("title")}
      </h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <InvestmentForm
          categories={categories}
          investment={investment}
          userCurrencies={currencyPrefs.currencies}
          defaultCurrency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale ?? locale}
        />
      </div>
    </div>
  );
}
