import Link from "next/link";
import { getCategories, deleteCategory } from "@/modules/categories/actions";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import { getTranslations } from "next-intl/server";

type CategoryItem = Awaited<ReturnType<typeof getCategories>>[number];

type Props = { params: Promise<{ locale: string }> };

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  const [all, t, tc] = await Promise.all([
    getCategories(),
    getTranslations("settings"),
    getTranslations("common"),
  ]);

  const system = all.filter((c) => c.userId === null);
  const custom = all.filter((c) => c.userId !== null);

  const systemExpenses = system.filter((c) => c.type === "EXPENSE");
  const systemIncome = system.filter((c) => c.type === "INCOME");
  const customExpenses = custom.filter((c) => c.type === "EXPENSE");
  const customIncome = custom.filter((c) => c.type === "INCOME");
  const customInvestment = custom.filter((c) => c.type === "INVESTMENT");

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
              {t("defaultLabel")}
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
              href={`/${locale}/dashboard/settings/categories/${c.id}/edit`}
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
                  label={tc("delete")}
                  confirmLabel={tc("yes_delete")}
                  cancelLabel={tc("keep")}
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
          <h1 className="text-2xl font-semibold text-gray-900">{t("categoriesTitle")}</h1>
          <p className="mt-0.5 text-sm text-gray-400">{t("categoriesSubtitle")}</p>
        </div>
        <Link
          href={`/${locale}/dashboard/settings/categories/new`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          {t("newCategory")}
        </Link>
      </div>

      {/* Default categories */}
      <div className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-400">{t("defaultCategories")}</h2>
        {systemExpenses.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-gray-400">{t("expenseLabel")}</p>
            <SystemCategoryList items={systemExpenses} />
          </div>
        )}
        {systemIncome.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-gray-400">{t("incomeLabel")}</p>
            <SystemCategoryList items={systemIncome} />
          </div>
        )}
      </div>

      {/* Custom categories */}
      <div className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-gray-400">{t("customCategories")}</h2>
        {custom.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-gray-400">{t("noCustomCategories")}</p>
            <Link
              href={`/${locale}/dashboard/settings/categories/new`}
              className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              {t("createFirst")}
            </Link>
          </div>
        ) : (
          <>
            {customExpenses.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-400">{t("expenseLabel")}</p>
                <CustomCategoryList items={customExpenses} />
              </div>
            )}
            {customIncome.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-400">{t("incomeLabel")}</p>
                <CustomCategoryList items={customIncome} />
              </div>
            )}
            {customInvestment.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-400">{t("investmentLabel")}</p>
                <CustomCategoryList items={customInvestment} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
