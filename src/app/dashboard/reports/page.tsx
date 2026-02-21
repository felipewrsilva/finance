import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { getMonthlyReport, getAccountBalanceHistory } from "@/modules/dashboard/actions";
import { getInvestments } from "@/modules/investments/actions";
import { formatCurrency } from "@/lib/utils";
import { totalProjectedValue } from "@/modules/investments/projections";
import MonthlyChart from "@/components/reports/monthly-chart";
import BalanceChart from "@/components/reports/balance-chart";
import { ProjectionsSection } from "@/components/investments/projections-section";
import { InvestmentList } from "@/components/investments/investment-list";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import Link from "next/link";

export default async function ReportsPage() {
  const [session, data, balanceHistory, investments, tr, ti] = await Promise.all([
    auth(),
    getMonthlyReport(6),
    getAccountBalanceHistory(6),
    getInvestments(),
    getTranslations("reports"),
    getTranslations("investments"),
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

  // Investment stats
  const active = investments.filter((inv) => inv.status === "ACTIVE");
  const totalPrincipal = active.reduce((s, inv) => s + Number(inv.principalAmount), 0);
  const totalCurrentValue = active.reduce((s, inv) => {
    const r = Number(inv.annualInterestRate) / 100;
    const p = Number(inv.principalAmount);
    const yearsElapsed =
      (Date.now() - new Date(inv.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return (
      s +
      totalProjectedValue(
        p, r, Math.max(yearsElapsed, 0),
        inv.recurrenceAmount ? Number(inv.recurrenceAmount) : 0,
        inv.recurrenceInterval ?? null
      )
    );
  }, 0);
  const totalGain = totalCurrentValue - totalPrincipal;
  const gainPct = totalPrincipal > 0 ? ((totalGain / totalPrincipal) * 100).toFixed(2) : "0.00";
  const totalProjected10y = active.reduce((s, inv) => {
    const r = Number(inv.annualInterestRate) / 100;
    const p = Number(inv.principalAmount);
    return (
      s +
      totalProjectedValue(
        p, r, 10,
        inv.recurrenceAmount ? Number(inv.recurrenceAmount) : 0,
        inv.recurrenceInterval ?? null
      )
    );
  }, 0);

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader title={tr("title")} subtitle={tr("subtitle")} />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label={tr("totalIncome")}
          value={fmt(totalIncome)}
          subtext={tr("avg", { amount: fmt(avgIncome) })}
          valueClassName="text-green-600"
        />
        <StatCard
          label={tr("totalExpenses")}
          value={fmt(totalExpense)}
          subtext={tr("avg", { amount: fmt(avgExpense) })}
          valueClassName="text-red-500"
        />
        <StatCard
          label={tr("netSavings")}
          value={fmt(totalNet)}
          subtext={tr("avg", { amount: fmt(avgNet) })}
          valueClassName={totalNet >= 0 ? "text-indigo-600" : "text-red-600"}
        />
        <StatCard
          label={tr("savingsRate")}
          value={totalIncome > 0 ? `${((totalNet / totalIncome) * 100).toFixed(1)}%` : "—"}
          subtext={tr("ofTotalIncome")}
          valueClassName={totalNet >= 0 ? "text-indigo-600" : "text-red-600"}
        />
      </div>

      {/* Income vs Expenses chart */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-6">
        <p className="mb-4 text-sm font-medium text-gray-500">{tr("incomeVsExpenses")}</p>
        {data.some((d) => d.income > 0 || d.expense > 0) ? (
          <MonthlyChart data={data} currency={currency} />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            {tr("noData")}
          </div>
        )}
      </div>

      {/* Account balance evolution chart */}
      {balanceHistory.accounts.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-6">
          <p className="mb-4 text-sm font-medium text-gray-500">{tr("accountBalance")}</p>
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
          <p className="text-sm font-medium text-gray-500">{tr("monthlyBreakdown")}</p>
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
                  <p className="text-xs text-gray-400">{tr("income")}</p>
                  <p className="font-medium tabular-nums text-green-600">{fmt(d.income)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{tr("expenses")}</p>
                  <p className="font-medium tabular-nums text-red-500">{fmt(d.expense)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">{tr("net")}</p>
                  <p className={`font-semibold tabular-nums ${net >= 0 ? "text-indigo-600" : "text-red-600"}`}>
                    {fmt(net)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Investments ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">{ti("title")}</h2>
            <p className="text-sm text-gray-500">
              {ti("activeInvestments", { count: active.length })}
            </p>
          </div>
          <Link
            href="/dashboard/investments/new"
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 active:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            {ti("addInvestment")}
          </Link>
        </div>

        {/* Investment stats */}
        {active.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
            <StatCard
              label={ti("totalInvested")}
              value={fmt(totalPrincipal)}
              valueClassName="text-gray-900"
            />
            <StatCard
              label={ti("currentValue")}
              value={fmt(totalCurrentValue)}
              subtext={totalGain >= 0 ? ti("gainPercent", { pct: gainPct }) : ti("lossPercent", { pct: gainPct })}
              valueClassName="text-violet-600"
            />
            <StatCard
              label={ti("totalGain")}
              value={fmt(totalGain)}
              valueClassName={totalGain >= 0 ? "text-emerald-600" : "text-red-500"}
            />
            <StatCard
              label={ti("projected10y")}
              value={fmt(totalProjected10y)}
              subtext={ti("projectedGain", { amount: fmt(totalProjected10y - totalPrincipal) })}
              valueClassName="text-violet-600"
            />
          </div>
        )}

        {/* Investment list */}
        <InvestmentList investments={investments} currency={currency} locale={locale} />

        {/* Projections */}
        {active.length > 0 && (
          <ProjectionsSection
            investments={active}
            currency={currency}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}
