import { auth } from "@/auth";
import { getMonthlyReport } from "@/modules/dashboard/actions";
import { formatCurrency } from "@/lib/utils";
import MonthlyChart from "@/components/reports/monthly-chart";

export default async function ReportsPage() {
  const [session, data] = await Promise.all([auth(), getMonthlyReport(6)]);
  const currency = session?.user?.defaultCurrency ?? "BRL";
  const locale = session?.user?.locale ?? "pt-BR";

  const fmt = (v: number) => formatCurrency(v, currency, locale);

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);
  const avgIncome = data.length ? totalIncome / data.length : 0;
  const avgExpense = data.length ? totalExpense / data.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Last 6 months overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total income (6 mo)</p>
          <p className="mt-1 text-lg font-bold text-green-600">{fmt(totalIncome)}</p>
          <p className="text-xs text-gray-400">avg {fmt(avgIncome)} / mo</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total expenses (6 mo)</p>
          <p className="mt-1 text-lg font-bold text-red-500">{fmt(totalExpense)}</p>
          <p className="text-xs text-gray-400">avg {fmt(avgExpense)} / mo</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="mb-4 text-sm font-semibold text-gray-700">Income vs Expenses</p>
        {data.some((d) => d.income > 0 || d.expense > 0) ? (
          <MonthlyChart data={data} currency={currency} />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            No data yet. Add some transactions to see your report.
          </div>
        )}
      </div>

      {/* Monthly breakdown table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-4 py-3">
          <p className="text-sm font-semibold text-gray-700">Monthly breakdown</p>
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
