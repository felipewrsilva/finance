import { getUserCurrencies } from "@/modules/currencies/actions";
import { AccountForm } from "@/components/accounts/account-form";

export default async function NewAccountPage() {
  const currencyPrefs = await getUserCurrencies();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-bold text-gray-900">New account</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <AccountForm
          currency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale}
        />
      </div>
    </div>
  );
}
