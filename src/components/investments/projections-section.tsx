import { getTranslations } from "next-intl/server";
import { formatCurrency } from "@/lib/utils";
import {
  buildGrowthSeries,
  calculateMilestones,
  totalProjectedValue,
} from "@/modules/investments/projections";
import { PROJECTION_HORIZONS } from "@/modules/investments/constants";
import { GrowthChart } from "./growth-chart";
import type { Investment, InvestmentCategory } from "@prisma/client";

type InvestmentWithCategory = Investment & { category: InvestmentCategory };

interface ProjectionsSectionProps {
  investments: InvestmentWithCategory[];
  currency?: string;
  locale?: string;
}

export async function ProjectionsSection({
  investments,
  currency = "BRL",
  locale = "pt-BR",
}: ProjectionsSectionProps) {
  const t = await getTranslations("investments");
  const active = investments.filter((inv) => inv.status === "ACTIVE");
  const fmt = (v: number) => formatCurrency(v, currency, locale);

  if (active.length === 0) return null;

  // Aggregate totals per horizon
  const aggregatePrincipal = active.reduce(
    (s, inv) => s + Number(inv.principalAmount),
    0
  );

  const aggregateHorizons = PROJECTION_HORIZONS.map((h) => {
    const total = active.reduce((s, inv) => {
      const r = Number(inv.annualInterestRate) / 100;
      const p = Number(inv.principalAmount);
      const contrib = inv.recurrenceAmount ? Number(inv.recurrenceAmount) : 0;
      return (
        s + totalProjectedValue(p, r, h, contrib, inv.recurrenceInterval ?? null)
      );
    }, 0);
    return { years: h, total };
  });

  return (
    <div className="space-y-6">
      {/* Horizon summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">{t("principalLabel")}</p>
          <p className="text-lg font-bold tabular-nums text-violet-700">
            {fmt(aggregatePrincipal)}
          </p>
        </div>
        {aggregateHorizons.map(({ years, total }) => (
          <div
            key={years}
            className="rounded-xl border border-violet-100 bg-violet-50 p-4 shadow-sm"
          >
            <p className="text-xs text-gray-400">{t("inYears", { years })}</p>
            <p className="text-lg font-bold tabular-nums text-violet-700">
              {fmt(total)}
            </p>
            <p className="text-xs text-emerald-600 tabular-nums">
              +{fmt(total - aggregatePrincipal)} {t("gain")}
            </p>
          </div>
        ))}
      </div>

      {/* Per-investment projections */}
      <div className="space-y-4">
        {active.map((inv) => {
          const r = Number(inv.annualInterestRate) / 100;
          const p = Number(inv.principalAmount);
          const contrib = inv.recurrenceAmount
            ? Number(inv.recurrenceAmount)
            : 0;
          const ms = calculateMilestones(
            p,
            r,
            contrib,
            inv.recurrenceInterval ?? null
          );
          const series = buildGrowthSeries(
            p,
            r,
            30,
            contrib,
            inv.recurrenceInterval ?? null
          );
          const displayName = inv.customCategoryName ?? inv.category.name;
          const compoundingLabel =
            inv.compounding === "DAILY"
              ? t("dailyCompounding")
              : t("annualCompounding");

          return (
            <div
              key={inv.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-6"
            >
              <div className="mb-4 flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-800">{displayName}</p>
                  <p className="text-xs text-gray-400">
                    {Number(inv.annualInterestRate).toFixed(2)}{t("perYrSuffix")} ·{" "}
                    {compoundingLabel}
                    {inv.recurring && inv.recurrenceInterval
                      ? ` · +${fmt(contrib)} / ${inv.recurrenceInterval.toLowerCase()}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-3 text-right flex-wrap">
                  {PROJECTION_HORIZONS.map((h) => {
                    const fv = totalProjectedValue(
                      p,
                      r,
                      h,
                      contrib,
                      inv.recurrenceInterval ?? null
                    );
                    return (
                      <div key={h}>
                        <p className="text-[10px] text-gray-400">{h}y</p>
                        <p className="text-sm font-semibold tabular-nums text-violet-700">
                          {fmt(fv)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Growth chart */}
              <GrowthChart
                series={series}
                milestones={ms}
                currency={currency}
                locale={locale}
                height={220}
              />

              {/* Milestones */}
              {ms.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    {t("milestones")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ms.map((m) => (
                      <span
                        key={m.multiple}
                        className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                      >
                        {t("timesIn", { multiple: m.multiple, years: m.years.toFixed(1) })}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
