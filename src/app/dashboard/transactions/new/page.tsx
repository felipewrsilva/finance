import { getAccounts } from "@/modules/accounts/actions";
import { getCategories } from "@/modules/categories/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import { getEnabledTransactionTypes } from "@/modules/user-settings/actions";
import { TransactionForm } from "@/components/transactions/transaction-form";

export default async function NewTransactionPage() {
  const [accounts, categories, currencyPrefs, enabledTypes] = await Promise.all([
    getAccounts(),
    getCategories(),
    getUserCurrencies(),
    getEnabledTransactionTypes(),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Transaction</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <TransactionForm
          accounts={accounts}
          categories={categories}
          userCurrencies={currencyPrefs.currencies}
          defaultCurrency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale}
          enabledTypes={enabledTypes}
        />
      </div>
    </div>
  );
}
