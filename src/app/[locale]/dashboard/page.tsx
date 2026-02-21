import { auth } from "@/auth";
import { getAccounts } from "@/modules/accounts/actions";
import { ACCOUNT_TYPE_ICONS } from "@/modules/accounts/constants";
import { getDashboardSummary } from "@/modules/dashboard/actions";
import { generateDueRecurrences } from "@/modules/transactions/actions";
import { MarkPaidButton } from "@/components/transactions/mark-paid-button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import type { Account } from "@prisma/client";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  await generateDueRecurrences();

  const { locale } = await params;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [session, accounts, { summary, recentTransactions, categoryBreakdown }, t, tc] =
    await Promise.all([
      auth(),
      getAccounts(),
      getDashboardSummary(month, year),
      getTranslations("dashboard"),
      getTranslations("common"),
    ]);

  const currency = session?.user?.defaultCurrency ?? "BRL";
  const userLocale = session?.user?.locale ?? locale;

  const fmt = (value: number) => formatCurrency(value, currency, userLocale);

  const totalBalance = accounts.reduce((sum: number, a: Account) => sum + Number(a.balance), 0);

  const monthLabel = formatDate(now, userLocale, { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={session?.user?.name?.split(" ")[0] ?? "Dashboard"}
        subtitle={monthLabel}
      />

      {/* Total balance */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 lg:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{t("totalBalance")}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-gray-900 sm:text-4xl">
          {fmt(totalBalance)}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {accounts.length === 1
            ? t("accounts_one", { count: accounts.length })
            : t("accounts_other", { count: accounts.length })}
        </p>
      </div>

      {/* Monthly summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
        <StatCard
          label={t("income")}
          value={fmt(summary.income)}
          subtext={summary.pendingIncome > 0 ? t("pendingAmount", { amount: fmt(summary.pendingIncome) }) : undefined}
          valueClassName="text-green-600"
        />
        <StatCard
          label={t("expenses")}
          value={fmt(summary.expense)}
          subtext={summary.pendingExpense > 0 ? t("pendingAmount", { amount: fmt(summary.pendingExpense) }) : undefined}
          valueClassName="text-red-500"
        />
        <StatCard
          label={t("net")}
          value={fmt(summary.net)}
          valueClassName={summary.net >= 0 ? "text-indigo-600" : "text-red-600"}
        />
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-medium text-gray-500">{t("spendingByCategory")}</h2>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            {categoryBreakdown.map((c, i) => {
              const pct = summary.expense > 0 ? (c.total / summary.expense) * 100 : 0;
              return (
                <div
                  key={c.categoryId}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i !== categoryBreakdown.length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <span className="text-base">{c.categoryIcon ?? "📦"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium text-gray-800">{c.categoryName}</span>
                      <span className="ml-2 text-sm font-semibold tabular-nums text-gray-900">{fmt(c.total)}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-red-400" style={{ width: `${Math.min(pct, 100).toFixed(1)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {recentTransactions.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">{t("recentTransactions")}</h2>
            <a href={`/${locale}/dashboard/transactions`} className="text-xs text-gray-400 transition-colors hover:text-gray-600">
              {t("viewAll")}
            </a>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            {recentTransactions.map((tx, i) => (
              <div
                key={tx.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i !== recentTransactions.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <span className="text-base">{tx.type === "TRANSFER" ? "↔️" : (tx.categoryIcon ?? "💸")}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {tx.description ?? tx.categoryName ?? (tx.type === "TRANSFER" ? tc("transfer") : tc("transaction"))}
                  </p>
                  <p className="text-xs text-gray-400">
                    {tx.accountName} ·{" "}
                    {formatDate(new Date(tx.date), userLocale, { day: "2-digit", month: "short" })}
                    {tx.status === "PENDING" && (
                      <span className="ml-1 rounded bg-yellow-100 px-1 py-0.5 text-yellow-700">{tc("pending")}</span>
                    )}
                  </p>
                </div>
                {tx.status === "PENDING" && <MarkPaidButton id={tx.id} />}
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    tx.type === "INCOME" ? "text-green-600" : tx.type === "EXPENSE" ? "text-red-500" : "text-indigo-600"
                  }`}
                >
                  {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                  {fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accounts summary */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">{t("accounts_other", { count: accounts.length })}</h2>
          <a href={`/${locale}/dashboard/accounts`} className="text-xs text-gray-400 transition-colors hover:text-gray-600">
            {t("manage")}
          </a>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-400">{t("noAccounts")}</p>
            <a href={`/${locale}/dashboard/accounts/new`} className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline">
              {t("addAccount")}
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-base">{ACCOUNT_TYPE_ICONS[a.type]}</span>
                  <span className="text-sm font-medium text-gray-900">{a.name}</span>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${Number(a.balance) >= 0 ? "text-gray-900" : "text-red-600"}`}>
                  {fmt(Number(a.balance))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
