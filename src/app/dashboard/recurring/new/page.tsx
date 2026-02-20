import { getAccounts } from "@/modules/accounts/actions";
import { getCategories } from "@/modules/categories/actions";
import RecurringForm from "@/components/recurring/recurring-form";

export default async function NewRecurringPage() {
  const [accounts, categories] = await Promise.all([getAccounts(), getCategories()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">New recurring rule</h1>
        <p className="text-sm text-gray-500">Schedule a transaction that repeats automatically.</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <RecurringForm accounts={accounts} categories={categories} />
      </div>
    </div>
  );
}
