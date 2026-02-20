import { notFound } from "next/navigation";
import { getRecurringRule } from "@/modules/recurring/actions";
import { getAccounts } from "@/modules/accounts/actions";
import { getCategories } from "@/modules/categories/actions";
import RecurringForm from "@/components/recurring/recurring-form";

export default async function EditRecurringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rule, accounts, categories] = await Promise.all([
    getRecurringRule(id),
    getAccounts(),
    getCategories(),
  ]);

  if (!rule) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Edit recurring rule</h1>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <RecurringForm rule={rule} accounts={accounts} categories={categories} />
      </div>
    </div>
  );
}
