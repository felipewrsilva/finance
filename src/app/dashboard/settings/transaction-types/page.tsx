import { getEnabledTransactionTypes } from "@/modules/user-settings/actions";
import { TransactionTypeSettings } from "@/components/settings/transaction-type-settings";

export default async function TransactionTypesPage() {
  const enabledTypes = await getEnabledTransactionTypes();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Transaction Types</h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Choose which transaction types are available when adding transactions.
        </p>
      </div>

      <TransactionTypeSettings enabledTypes={enabledTypes} />
    </div>
  );
}
