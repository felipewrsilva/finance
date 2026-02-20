import { auth } from "@/auth";
import { getAccounts } from "@/modules/accounts/actions";
import { ACCOUNT_TYPE_ICONS } from "@/modules/accounts/constants";
import { getDashboardSummary } from "@/modules/dashboard/actions";
import { MarkPaidButton } from "@/components/transactions/mark-paid-button";
import { formatCurrency } from "@/lib/utils";
import type { Account } from "@prisma/client";

export default async function DashboardPage() {
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
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Hi, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500">Here&apos;s your financial overview for {monthLabel}.</p>
      </div>

      {/* Total balance */}
      <div className="rounded-xl bg-indigo-600 p-6 text-white shadow lg:p-8">
        <p className="text-sm font-medium opacity-80">Total balance</p>
        <p className="mt-1 text-3xl font-bold lg:text-4xl">{fmt(totalBalance)}</p>
        <p className="mt-1 text-xs opacity-60">
          Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Monthly summary cards */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <p className="text-xs font-medium text-gray-500">Income</p>
          <p className="mt-1 text-lg font-bold text-green-600 lg:text-xl">{fmt(summary.income)}</p>
          {summary.pendingIncome > 0 && (
            <p className="mt-0.5 text-xs text-gray-400">+{fmt(summary.pendingIncome)} pending</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <p className="text-xs font-medium text-gray-500">Expenses</p>
          <p className="mt-1 text-lg font-bold text-red-500 lg:text-xl">{fmt(summary.expense)}</p>
          {summary.pendingExpense > 0 && (
            <p className="mt-0.5 text-xs text-gray-400">+{fmt(summary.pendingExpense)} pending</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <p className="text-xs font-medium text-gray-500">Net</p>
          <p
            className={`mt-1 text-lg font-bold lg:text-xl ${
              summary.net >= 0 ? "text-indigo-600" : "text-red-600"
            }`}
          >
            {fmt(summary.net)}
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Top expense categories</h2>
            <a href="/dashboard/transactions" className="text-xs text-indigo-600 hover:underline">
              View all →
            </a>
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
                      <span className="ml-2 text-sm font-semibold text-gray-900">
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
            <h2 className="text-sm font-semibold text-gray-700">Recent transactions</h2>
            <a href="/dashboard/transactions" className="text-xs text-indigo-600 hover:underline">
              View all →
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
                  className={`text-sm font-semibold ${
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
          <h2 className="text-sm font-semibold text-gray-700">Accounts</h2>
          <a
            href="/dashboard/accounts"
            className="text-xs text-indigo-600 hover:underline"
          >
            Manage →
          </a>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            No accounts yet.{" "}
            <a
              href="/dashboard/accounts/new"
              className="font-medium text-indigo-600 hover:underline"
            >
              Create one →
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
                  className={`text-sm font-semibold ${
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
