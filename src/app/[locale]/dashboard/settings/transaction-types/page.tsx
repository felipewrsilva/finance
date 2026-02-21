import { getEnabledTransactionTypes } from "@/modules/user-settings/actions";
import { TransactionTypeSettings } from "@/components/settings/transaction-type-settings";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function TransactionTypesPage({ params }: Props) {
  // params is needed for the route to work with next-intl
  await params;
  const [enabledTypes, t] = await Promise.all([
    getEnabledTransactionTypes(),
    getTranslations("settings"),
  ]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("transactionTypesTitle")}</h1>
        <p className="mt-0.5 text-sm text-gray-400">{t("transactionTypesSubtitle")}</p>
      </div>

      <TransactionTypeSettings enabledTypes={enabledTypes} />
    </div>
  );
}
