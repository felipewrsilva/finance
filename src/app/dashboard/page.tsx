import { auth } from "@/auth";
import { getAccounts } from "@/modules/accounts/actions";
import { ACCOUNT_TYPE_ICONS } from "@/modules/accounts/constants";
import { getDashboardSummary } from "@/modules/dashboard/actions";
import { generateDueRecurrences } from "@/modules/transactions/actions";
import { MarkPaidButton } from "@/components/transactions/mark-paid-button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import type { Account } from "@prisma/client";

export default async function DashboardPage() {
  await generateDueRecurrences();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [session, accounts, { summary, recentTransactions, categoryBreakdown }] =
    await Promise.all([auth(), getAccounts(), getDashboardSummary(month, year)]);

  const currency = session?.user?.defaultCurrency ?? "BRL";
  const locale = session?.user?.locale ?? "pt-BR";

  const fmt = (value: number) => formatCurrency(value, currency, locale);

  const totalBalance = accounts.reduce((sum: number, a: Account) => sum + Number(a.balance), 0);

  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={session?.user?.name?.split(" ")[0] ?? "Dashboard"}
        subtitle={monthLabel}
      />

      {/* Total balance */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 lg:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total balance</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-gray-900 sm:text-4xl">{fmt(totalBalance)}</p>
        <p className="mt-1 text-xs text-gray-400">
          {accounts.length} account{accounts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Monthly summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
        <StatCard
          label="Income"
          value={fmt(summary.income)}
          subtext={summary.pendingIncome > 0 ? `+${fmt(summary.pendingIncome)} pending` : undefined}
          valueClassName="text-green-600"
        />
        <StatCard
          label="Expenses"
          value={fmt(summary.expense)}
          subtext={summary.pendingExpense > 0 ? `+${fmt(summary.pendingExpense)} pending` : undefined}
          valueClassName="text-red-500"
        />
        <StatCard
          label="Net"
          value={fmt(summary.net)}
          valueClassName={summary.net >= 0 ? "text-indigo-600" : "text-red-600"}
        />
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-medium text-gray-500">Spending by category</h2>
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
                      <span className="truncate text-sm font-medium text-gray-800">
                        {c.categoryName}
                      </span>
                      <span className="ml-2 text-sm font-semibold tabular-nums text-gray-900">
                        {fmt(c.total)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-red-400"
                        style={{ width: `${Math.min(pct, 100).toFixed(1)}%` }}
                      />
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
            <h2 className="text-sm font-medium text-gray-500">Recent transactions</h2>
            <a href="/dashboard/transactions" className="text-xs text-gray-400 transition-colors hover:text-gray-600">
              View all
            </a>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            {recentTransactions.map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i !== recentTransactions.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <span className="text-base">{t.type === "TRANSFER" ? "↔️" : (t.categoryIcon ?? "💸")}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {t.description ?? t.categoryName ?? (t.type === "TRANSFER" ? "Transfer" : "Transaction")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t.accountName} ·{" "}
                    {new Date(t.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                    {t.status === "PENDING" && (
                      <span className="ml-1 rounded bg-yellow-100 px-1 py-0.5 text-yellow-700">
                        pending
                      </span>
                    )}
                  </p>
                </div>
                {t.status === "PENDING" && <MarkPaidButton id={t.id} />}
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    t.type === "INCOME" ? "text-green-600" : t.type === "EXPENSE" ? "text-red-500" : "text-indigo-600"
                  }`}
                >
                  {t.type === "INCOME" ? "+" : t.type === "EXPENSE" ? "-" : ""}
                  {fmt(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accounts summary */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Accounts</h2>
          <a
            href="/dashboard/accounts"
            className="text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            Manage
          </a>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-400">No accounts yet.</p>
            <a
              href="/dashboard/accounts/new"
              className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              Add account
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{ACCOUNT_TYPE_ICONS[a.type]}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {a.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    Number(a.balance) >= 0 ? "text-gray-900" : "text-red-600"
                  }`}
                >
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
