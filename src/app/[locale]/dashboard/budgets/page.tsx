import { auth } from "@/auth";
import { getBudgets } from "@/modules/budgets/actions";
import BudgetList from "@/components/budgets/budget-list";
import { PageHeader } from "@/components/ui/page-header";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function BudgetsPage({ params }: Props) {
  const { locale } = await params;
  const now = new Date();
  const [session, budgets, t] = await Promise.all([
    auth(),
    getBudgets(now.getMonth() + 1, now.getFullYear()),
    getTranslations("budgets"),
  ]);

  const currency = session?.user?.defaultCurrency ?? "BRL";
  const userLocale = session?.user?.locale ?? locale;
  const monthLabel = now.toLocaleString(userLocale, { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        title={t("title")}
        subtitle={monthLabel}
        action={
          <a
            href={`/${locale}/dashboard/budgets/new`}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {t("newBudget")}
          </a>
        }
      />
      <BudgetList budgets={budgets} currency={currency} />
    </div>
  );
}
