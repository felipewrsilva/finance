import { auth } from "@/auth";
import { getMonthlyReport, getAccountBalanceHistory } from "@/modules/dashboard/actions";
import { getInvestments } from "@/modules/investments/actions";
import { formatCurrency } from "@/lib/utils";
import MonthlyChart from "@/components/reports/monthly-chart";
import BalanceChart from "@/components/reports/balance-chart";
import { ProjectionsSection } from "@/components/investments/projections-section";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

export default async function ReportsPage() {
  const [session, data, balanceHistory, investments] = await Promise.all([
    auth(),
    getMonthlyReport(6),
    getAccountBalanceHistory(6),
    getInvestments("ACTIVE"),
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
      <PageHeader title="Reports" subtitle="Last 6 months" />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label="Total income (6 mo)"
          value={fmt(totalIncome)}
          subtext={`avg ${fmt(avgIncome)} / mo`}
          valueClassName="text-green-600"
        />
        <StatCard
          label="Total expenses (6 mo)"
          value={fmt(totalExpense)}
          subtext={`avg ${fmt(avgExpense)} / mo`}
          valueClassName="text-red-500"
        />
        <StatCard
          label="Net savings (6 mo)"
          value={fmt(totalNet)}
          subtext={`avg ${fmt(avgNet)} / mo`}
          valueClassName={totalNet >= 0 ? "text-indigo-600" : "text-red-600"}
        />
        <StatCard
          label="Savings rate"
          value={totalIncome > 0 ? `${((totalNet / totalIncome) * 100).toFixed(1)}%` : "—"}
          subtext="of total income"
          valueClassName={totalNet >= 0 ? "text-indigo-600" : "text-red-600"}
        />
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
              <div className="flex gap-3 text-right text-sm sm:gap-6">
                <div>
                  <p className="text-xs text-gray-400">Income</p>
                  <p className="font-medium tabular-nums text-green-600">{fmt(d.income)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Expenses</p>
                  <p className="font-medium tabular-nums text-red-500">{fmt(d.expense)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Net</p>
                  <p className={`font-semibold tabular-nums ${net >= 0 ? "text-indigo-600" : "text-red-600"}`}>
                    {fmt(net)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Investment projections */}
      {investments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800">
            Investment Projections
          </h2>
          <ProjectionsSection
            investments={investments}
            currency={currency}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}
