import { getTranslations } from "next-intl/server";
import { formatCurrency } from "@/lib/utils";
import type { ProjectionComparison } from "@/modules/investments/projection-comparison";

interface Props {
  data: ProjectionComparison;
  currency: string;
  locale: string;
  compact?: boolean;
}

export async function ProjectionComparisonCard({
  data,
  currency,
  locale,
  compact = false,
}: Props) {
  const t = await getTranslations("projections");
  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const ratePct = (data.blendedAnnualRate * 100).toFixed(1);

  if (compact) {
    const h10 = data.horizons.find((h) => h.years === 10) ?? data.horizons[0];
    return (
      <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
          {t("compactTitle")}
        </p>
        <p className="mt-1 text-sm text-gray-600">{t("compactSubtitle")}</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400">{t("deltaLabel")}</p>
            <p className="text-lg font-semibold tabular-nums text-violet-700">
              +{fmt(h10.delta)}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {t("yearsLabel", { years: h10.years })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:p-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{t("title")}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-400">{t("currentMonthly")}</p>
          <p className="text-sm font-semibold tabular-nums text-gray-900">
            {fmt(data.currentMonthlyContribution)}
          </p>
        </div>
        <div className="rounded-lg bg-violet-50 px-3 py-2">
          <p className="text-xs text-violet-500">{t("optimizedMonthly")}</p>
          <p className="text-sm font-semibold tabular-nums text-violet-700">
            {fmt(data.optimizedMonthlyContribution)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {data.horizons.map((h) => (
          <div
            key={h.years}
            className="rounded-lg border border-gray-100 px-3 py-3"
          >
            <p className="text-xs font-medium text-gray-500">
              {t("yearsLabel", { years: h.years })}
            </p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-gray-400">{t("current")}</span>
                <span className="font-medium tabular-nums text-gray-700">
                  {fmt(h.current)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-violet-500">{t("optimized")}</span>
                <span className="font-semibold tabular-nums text-violet-700">
                  {fmt(h.optimized)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-emerald-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {t("deltaTitle")}
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          {t("deltaBody", {
            monthly: fmt(data.redirectedMonthlyTotal),
            boost10y: fmt(
              data.horizons.find((h) => h.years === 10)?.delta ?? 0
            ),
          })}
        </p>
      </div>

      <ul className="space-y-1 text-xs text-gray-400">
        <li>{t("assumptionRate", { rate: ratePct })}</li>
        <li>
          {t("assumptionInvestments", { count: data.activeInvestmentCount })}
        </li>
        <li>{t("assumptionRedirect", { amount: fmt(data.redirectedMonthlyTotal) })}</li>
      </ul>
    </div>
  );
}
