import { getUserCurrencies } from "@/modules/currencies/actions";
import { SUPPORTED_CURRENCIES } from "@/modules/currencies/constants";
import { CurrencyList } from "@/components/settings/currency-list";

export default async function CurrencySettingsPage() {
  const { defaultCurrency, currencies } = await getUserCurrencies();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Currency</h1>

      <div className="rounded-xl border border-gray-100 bg-white px-5 py-2 shadow-sm">
        <CurrencyList
          enabledCodes={currencies}
          defaultCurrency={defaultCurrency}
          allCurrencies={SUPPORTED_CURRENCIES}
        />
      </div>
    </div>
  );
}
