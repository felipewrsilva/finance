import { notFound } from "next/navigation";
import { getTransaction } from "@/modules/transactions/actions";
import { getAccounts } from "@/modules/accounts/actions";
import { getCategories } from "@/modules/categories/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import { getEnabledTransactionTypes } from "@/modules/user-settings/actions";
import { TransactionForm } from "@/components/transactions/transaction-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTransactionPage({ params }: PageProps) {
  const { id } = await params;
  const [transaction, accounts, categories, currencyPrefs, enabledTypes] = await Promise.all([
    getTransaction(id),
    getAccounts(),
    getCategories(),
    getUserCurrencies(),
    getEnabledTransactionTypes(),
  ]);

  if (!transaction) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Transaction</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <TransactionForm
          accounts={accounts}
          categories={categories}
          transaction={transaction}
          userCurrencies={currencyPrefs.currencies}
          defaultCurrency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale}
          enabledTypes={enabledTypes}
        />
      </div>
    </div>
  );
}
