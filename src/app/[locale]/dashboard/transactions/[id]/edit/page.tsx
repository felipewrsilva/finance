import { notFound } from "next/navigation";
import { getTransaction } from "@/modules/transactions/actions";
import { getAccounts } from "@/modules/accounts/actions";
import { getCategories } from "@/modules/categories/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import { getEnabledTransactionTypes } from "@/modules/user-settings/actions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditTransactionPage({ params }: Props) {
  const { locale, id } = await params;
  const [transaction, accounts, categories, currencyPrefs, enabledTypes, t] = await Promise.all([
    getTransaction(id),
    getAccounts(),
    getCategories(),
    getUserCurrencies(),
    getEnabledTransactionTypes(),
    getTranslations("transactions"),
  ]);

  if (!transaction) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("editTitle")}</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <TransactionForm
          accounts={accounts}
          categories={categories}
          transaction={transaction}
          userCurrencies={currencyPrefs.currencies}
          defaultCurrency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale ?? locale}
          enabledTypes={enabledTypes}
        />
      </div>
    </div>
  );
}
