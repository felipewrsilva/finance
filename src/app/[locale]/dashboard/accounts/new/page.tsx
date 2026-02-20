import { getUserCurrencies } from "@/modules/currencies/actions";
import { AccountForm } from "@/components/accounts/account-form";
import { getTranslations } from "next-intl/server";

export default async function NewAccountPage() {
  const [currencyPrefs, t] = await Promise.all([
    getUserCurrencies(),
    getTranslations("accounts"),
  ]);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-xl font-bold text-gray-900">{t("newTitle")}</h1>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <AccountForm
          currency={currencyPrefs.defaultCurrency}
          locale={currencyPrefs.locale}
        />
      </div>
    </div>
  );
}
