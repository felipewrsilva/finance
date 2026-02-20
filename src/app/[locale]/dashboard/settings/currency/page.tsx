import { getUserCurrencies } from "@/modules/currencies/actions";
import { SUPPORTED_CURRENCIES } from "@/modules/currencies/constants";
import { CurrencyList } from "@/components/settings/currency-list";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function CurrencySettingsPage({ params }: Props) {
  const [{ defaultCurrency, currencies }, t] = await Promise.all([
    getUserCurrencies(),
    getTranslations("settings"),
  ]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("currencyTitle")}</h1>
        <p className="mt-0.5 text-sm text-gray-400">{t("currencySubtitle")}</p>
      </div>

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
