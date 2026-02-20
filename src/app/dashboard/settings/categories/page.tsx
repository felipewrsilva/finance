import Link from "next/link";
import { getCategories, deleteCategory } from "@/modules/categories/actions";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";

type CategoryItem = Awaited<ReturnType<typeof getCategories>>[number];

export default async function CategoriesPage() {
  const all = await getCategories();

  const system = all.filter((c) => c.userId === null);
  const custom = all.filter((c) => c.userId !== null);

  const systemExpenses = system.filter((c) => c.type === "EXPENSE");
  const systemIncome = system.filter((c) => c.type === "INCOME");
  const customExpenses = custom.filter((c) => c.type === "EXPENSE");
  const customIncome = custom.filter((c) => c.type === "INCOME");

  function SystemCategoryList({ items }: { items: CategoryItem[] }) {
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
            <span className="w-7 shrink-0 text-center text-xl">{c.icon ?? "📌"}</span>
            <span className="flex-1 truncate text-sm text-gray-700">{c.name}</span>
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
              Default
            </span>
          </div>
        ))}
      </div>
    );
  }

  function CustomCategoryList({ items }: { items: CategoryItem[] }) {
    if (items.length === 0) return null;
    return (
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {items.map((c, i) => (
          <div
            key={c.id}
            className={`flex items-center overflow-hidden ${
              i !== items.length - 1 ? "border-b border-gray-50" : ""
            }`}
          >
            <Link
              href={`/dashboard/settings/categories/${c.id}/edit`}
              className="flex flex-1 items-center gap-3 min-w-0 px-4 py-3 transition-colors hover:bg-gray-50/60 active:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
            >
              <span className="w-7 shrink-0 text-center text-xl">{c.icon ?? "📌"}</span>
              <span className="flex-1 truncate text-sm font-medium text-gray-900">{c.name}</span>
            </Link>
            <div className="pr-4 shrink-0">
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-0.5 text-sm text-gray-400">Manage your spending categories</p>
        </div>
        <Link
          href="/dashboard/settings/categories/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          + New
        </Link>
      </div>

      {/* Default categories */}
      <div className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-400">Default</h2>
        {systemExpenses.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-gray-400">Expense</p>
            <SystemCategoryList items={systemExpenses} />
          </div>
        )}
        {systemIncome.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-gray-400">Income</p>
            <SystemCategoryList items={systemIncome} />
          </div>
        )}
      </div>

      {/* Custom categories */}
      <div className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-400">Custom</h2>
        {custom.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-gray-400">No custom categories yet.</p>
            <Link
              href="/dashboard/settings/categories/new"
              className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              Create your first category
            </Link>
          </div>
        ) : (
          <>
            {customExpenses.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-400">Expense</p>
                <CustomCategoryList items={customExpenses} />
              </div>
            )}
            {customIncome.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-400">Income</p>
                <CustomCategoryList items={customIncome} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

