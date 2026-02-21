import { notFound } from "next/navigation";
import { getInvestment, getInvestmentCategories } from "@/modules/investments/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import { InvestmentForm } from "@/components/investments/investment-form";
import { PageHeader } from "@/components/ui/page-header";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvestmentPage({ params }: PageProps) {
  const { id } = await params;
  const [investment, categories, currencyPrefs] = await Promise.all([
    getInvestment(id),
    getInvestmentCategories(),
    getUserCurrencies(),
  ]);

  if (!investment) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Edit Investment" />
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <InvestmentForm
          categories={categories}
          investment={investment}
          userCurrencies={currencyPrefs.currencies}
          defaultCurrency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale}
        />
      </div>
    </div>
  );
}
