import Link from "next/link";
import { getUserCategories, deleteCategory } from "@/modules/categories/actions";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";

export default async function CategoriesPage() {
  const categories = await getUserCategories();

  const expenses = categories.filter((c) => c.type === "EXPENSE");
  const income = categories.filter((c) => c.type === "INCOME");

  function CategoryList({
    items,
  }: {
    items: Awaited<ReturnType<typeof getUserCategories>>;
  }) {
    if (items.length === 0) return null;
    return (
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {items.map((c, i) => (
          <div
            key={c.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              i !== items.length - 1 ? "border-b border-gray-50" : ""
            }`}
          >
            <span className="text-xl w-7 text-center">{c.icon ?? "📌"}</span>
            <span className="flex-1 text-sm font-medium text-gray-900">{c.name}</span>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/dashboard/settings/categories/${c.id}/edit`}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50"
              >
                Edit
              </Link>
              <form
                action={async () => {
                  "use server";
                  await deleteCategory(c.id);
                }}
              >
                <InlineConfirmButton
                  label="Delete"
                  confirmLabel="Yes, delete"
                  cancelLabel="Keep"
                />
              </form>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">Manage your custom categories</p>
        </div>
        <Link
          href="/dashboard/settings/categories/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          + New
        </Link>
      </div>

      {categories.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-gray-500">No custom categories yet.</p>
          <Link
            href="/dashboard/settings/categories/new"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            Create your first category →
          </Link>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Expense
          </h2>
          <CategoryList items={expenses} />
        </div>
      )}

      {income.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Income
          </h2>
          <CategoryList items={income} />
        </div>
      )}
    </div>
  );
}
