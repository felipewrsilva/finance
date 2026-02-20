import { auth } from "@/auth";
import { getMonthlyReport, getAccountBalanceHistory } from "@/modules/dashboard/actions";
import { formatCurrency } from "@/lib/utils";
import MonthlyChart from "@/components/reports/monthly-chart";
import BalanceChart from "@/components/reports/balance-chart";

export default async function ReportsPage() {
  const [session, data, balanceHistory] = await Promise.all([
    auth(),
    getMonthlyReport(6),
    getAccountBalanceHistory(6),
  ]);
  const currency = session?.user?.defaultCurrency ?? "BRL";
  const locale = session?.user?.locale ?? "pt-BR";

  const fmt = (v: number) => formatCurrency(v, currency, locale);

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);
  const avgIncome = data.length ? totalIncome / data.length : 0;
  const avgExpense = data.length ? totalExpense / data.length : 0;
  const totalNet = totalIncome - totalExpense;
  const avgNet = data.length ? totalNet / data.length : 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-0.5 text-sm text-gray-400">Last 6 months</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <p className="text-xs font-medium text-gray-500">Total income (6 mo)</p>
          <p className="mt-1 text-lg font-bold text-green-600 lg:text-xl">{fmt(totalIncome)}</p>
          <p className="text-xs text-gray-400">avg {fmt(avgIncome)} / mo</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <p className="text-xs font-medium text-gray-500">Total expenses (6 mo)</p>
          <p className="mt-1 text-lg font-bold text-red-500 lg:text-xl">{fmt(totalExpense)}</p>
          <p className="text-xs text-gray-400">avg {fmt(avgExpense)} / mo</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <p className="text-xs font-medium text-gray-500">Net savings (6 mo)</p>
          <p className={`mt-1 text-lg font-bold lg:text-xl ${totalNet >= 0 ? "text-indigo-600" : "text-red-600"}`}>
            {fmt(totalNet)}
          </p>
          <p className="text-xs text-gray-400">avg {fmt(avgNet)} / mo</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-5">
          <p className="text-xs font-medium text-gray-500">Savings rate</p>
          <p className={`mt-1 text-lg font-bold lg:text-xl ${totalNet >= 0 ? "text-indigo-600" : "text-red-600"}`}>
            {totalIncome > 0 ? `${((totalNet / totalIncome) * 100).toFixed(1)}%` : "—"}
          </p>
          <p className="text-xs text-gray-400">of total income</p>
        </div>
      </div>

      {/* Income vs Expenses chart */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-6">
        <p className="mb-4 text-sm font-medium text-gray-500">Income vs Expenses</p>
        {data.some((d) => d.income > 0 || d.expense > 0) ? (
          <MonthlyChart data={data} currency={currency} />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            No data yet. Add some transactions to see your report.
          </div>
        )}
      </div>

      {/* Account balance evolution chart */}
      {balanceHistory.accounts.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-6">
          <p className="mb-4 text-sm font-medium text-gray-500">Account balance evolution</p>
          <BalanceChart
            accounts={balanceHistory.accounts}
            dataPoints={balanceHistory.dataPoints}
            currency={currency}
          />
        </div>
      )}

      {/* Monthly breakdown table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-4 py-3 lg:px-6">
          <p className="text-sm font-medium text-gray-500">Monthly breakdown</p>
        </div>
        {data.map((d, i) => {
          const net = d.income - d.expense;
          return (
            <div
              key={`${d.month}-${d.year}`}
              className={`flex items-center justify-between px-4 py-3 ${
                i !== data.length - 1 ? "border-b border-gray-50" : ""
              }`}
            >
              <span className="text-sm font-medium text-gray-700">
                {d.month} {d.year}
              </span>
              <div className="flex gap-6 text-right text-sm">
                <div>
                  <p className="text-xs text-gray-400">Income</p>
                  <p className="font-medium text-green-600">{fmt(d.income)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Expenses</p>
                  <p className="font-medium text-red-500">{fmt(d.expense)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Net</p>
                  <p className={`font-semibold ${net >= 0 ? "text-indigo-600" : "text-red-600"}`}>
                    {fmt(net)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
