import { auth } from "@/auth";
import { getInvestments } from "@/modules/investments/actions";
import { getUserCurrencies } from "@/modules/currencies/actions";
import { InvestmentList } from "@/components/investments/investment-list";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { totalProjectedValue } from "@/modules/investments/projections";
import Link from "next/link";

export default async function InvestmentsPage() {
  const [session, investments, currencyPrefs] = await Promise.all([
    auth(),
    getInvestments(),
    getUserCurrencies(),
  ]);

  const currency = session?.user?.defaultCurrency ?? currencyPrefs.defaultCurrency;
  const locale = session?.user?.locale ?? currencyPrefs.locale;
  const fmt = (v: number) => formatCurrency(v, currency, locale);

  const active = investments.filter((inv) => inv.status === "ACTIVE");

  const totalPrincipal = active.reduce(
    (s, inv) => s + Number(inv.principalAmount),
    0
  );

  const totalCurrentValue = active.reduce((s, inv) => {
    const r = Number(inv.annualInterestRate) / 100;
    const p = Number(inv.principalAmount);
    const yearsElapsed =
      (Date.now() - new Date(inv.startDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return (
      s +
      totalProjectedValue(
        p,
        r,
        Math.max(yearsElapsed, 0),
        inv.recurrenceAmount ? Number(inv.recurrenceAmount) : 0,
        inv.recurrenceInterval ?? null
      )
    );
  }, 0);

  const totalGain = totalCurrentValue - totalPrincipal;
  const gainPct =
    totalPrincipal > 0
      ? ((totalGain / totalPrincipal) * 100).toFixed(2)
      : "0.00";

  const totalProjected10y = active.reduce((s, inv) => {
    const r = Number(inv.annualInterestRate) / 100;
    const p = Number(inv.principalAmount);
    return (
      s +
      totalProjectedValue(
        p,
        r,
        10,
        inv.recurrenceAmount ? Number(inv.recurrenceAmount) : 0,
        inv.recurrenceInterval ?? null
      )
    );
  }, 0);

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        title="Investments"
        subtitle={`${active.length} active investment${active.length !== 1 ? "s" : ""}`}
        action={
          <Link
            href="/dashboard/investments/new"
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 active:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            + New
          </Link>
        }
      />

      {/* Summary */}
      <section
        aria-label="Investment summary"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4"
      >
        <StatCard
          label="Total invested"
          value={fmt(totalPrincipal)}
          valueClassName="text-gray-900"
        />
        <StatCard
          label="Current value"
          value={fmt(totalCurrentValue)}
          subtext={totalGain >= 0 ? `+${gainPct}% gain` : `${gainPct}% loss`}
          valueClassName="text-violet-600"
        />
        <StatCard
          label="Total gain"
          value={fmt(totalGain)}
          valueClassName={totalGain >= 0 ? "text-emerald-600" : "text-red-500"}
        />
        <StatCard
          label="Projected (10y)"
          value={fmt(totalProjected10y)}
          subtext={`+${fmt(totalProjected10y - totalPrincipal)}`}
          valueClassName="text-violet-600"
        />
      </section>

      {/* List */}
      <InvestmentList
        investments={investments}
        currency={currency}
        locale={locale}
      />
    </div>
  );
}
