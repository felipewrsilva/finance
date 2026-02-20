import { auth } from "@/auth";
import { getMonthlyReport, getAccountBalanceHistory } from "@/modules/dashboard/actions";
import { formatCurrency } from "@/lib/utils";
import MonthlyChart from "@/components/reports/monthly-chart";
import BalanceChart from "@/components/reports/balance-chart";
import { StatCard } from "@/components/ui/stat-card";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function ReportsPage({ params }: Props) {
  const { locale } = await params;
  const [session, data, balanceHistory, t] = await Promise.all([
    auth(),
    getMonthlyReport(6),
    getAccountBalanceHistory(6),
    getTranslations("reports"),
  ]);

  const currency = session?.user?.defaultCurrency ?? "BRL";
  const userLocale = session?.user?.locale ?? locale;
  const fmt = (v: number) => formatCurrency(v, currency, userLocale);

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);
  const avgIncome = data.length ? totalIncome / data.length : 0;
  const avgExpense = data.length ? totalExpense / data.length : 0;
  const totalNet = totalIncome - totalExpense;
  const avgNet = data.length ? totalNet / data.length : 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-0.5 text-sm text-gray-400">{t("subtitle")}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label={t("totalIncome")}
          value={fmt(totalIncome)}
          subtext={t("avg", { amount: fmt(avgIncome) })}
          valueClassName="text-green-600"
        />
        <StatCard
          label={t("totalExpenses")}
          value={fmt(totalExpense)}
          subtext={t("avg", { amount: fmt(avgExpense) })}
          valueClassName="text-red-500"
        />
        <StatCard
          label={t("netSavings")}
          value={fmt(totalNet)}
          subtext={t("avg", { amount: fmt(avgNet) })}
          valueClassName={totalNet >= 0 ? "text-indigo-600" : "text-red-600"}
        />
        <StatCard
          label={t("savingsRate")}
          value={totalIncome > 0 ? `${((totalNet / totalIncome) * 100).toFixed(1)}%` : "—"}
          subtext={t("ofTotalIncome")}
          valueClassName={totalNet >= 0 ? "text-indigo-600" : "text-red-600"}
        />
      </div>

      {/* Income vs Expenses chart */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-6">
        <p className="mb-4 text-sm font-medium text-gray-500">{t("incomeVsExpenses")}</p>
        {data.some((d) => d.income > 0 || d.expense > 0) ? (
          <MonthlyChart data={data} currency={currency} />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            {t("noData")}
          </div>
        )}
      </div>

      {/* Account balance evolution chart */}
      {balanceHistory.accounts.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-6">
          <p className="mb-4 text-sm font-medium text-gray-500">{t("accountBalance")}</p>
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
          <p className="text-sm font-medium text-gray-500">{t("monthlyBreakdown")}</p>
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
                  <p className="text-xs text-gray-400">{t("income")}</p>
                  <p className="font-medium tabular-nums text-green-600">{fmt(d.income)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t("expenses")}</p>
                  <p className="font-medium tabular-nums text-red-500">{fmt(d.expense)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t("net")}</p>
                  <p className={`font-semibold tabular-nums ${net >= 0 ? "text-indigo-600" : "text-red-600"}`}>
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
