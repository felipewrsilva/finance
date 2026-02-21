import { getAccounts } from "@/modules/accounts/actions";
import { getCategories } from "@/modules/categories/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import { getEnabledTransactionTypes } from "@/modules/user-settings/actions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function NewTransactionPage({ params }: Props) {
  const { locale } = await params;
  const [accounts, categories, currencyPrefs, enabledTypes, t] = await Promise.all([
    getAccounts(),
    getCategories(),
    getUserCurrencies(),
    getEnabledTransactionTypes(),
    getTranslations("transactions"),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("newTitle")}</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <TransactionForm
          accounts={accounts}
          categories={categories}
          userCurrencies={currencyPrefs.currencies}
          defaultCurrency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale ?? locale}
          enabledTypes={enabledTypes}
        />
      </div>
    </div>
  );
}
