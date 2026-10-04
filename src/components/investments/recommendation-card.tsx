import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "@/lib/utils";
import type { Recommendation } from "@/modules/investments/recommendations";

interface Props {
  recommendation: Recommendation;
  currency: string;
  locale: string;
}

const ICONS: Record<string, string> = {
  "start-investing-from-optional": "🚀",
  "add-recurring-contributions": "↻",
  "redirect-optional-to-investments": "📈",
  "raise-investment-budget-group": "🎯",
  "celebrate-optional-decrease": "🎉",
};

const CTA: Record<string, { path: string; labelKey: string }> = {
  "start-investing-from-optional": {
    path: "/dashboard/reports",
    labelKey: "ctaAddInvestment",
  },
  "add-recurring-contributions": {
    path: "/dashboard/reports",
    labelKey: "ctaEditInvestment",
  },
  "redirect-optional-to-investments": {
    path: "/dashboard/budgets",
    labelKey: "ctaReviewBudgets",
  },
  "raise-investment-budget-group": {
    path: "/dashboard/budgets",
    labelKey: "ctaReviewBudgets",
  },
};

export async function RecommendationCard({
  recommendation,
  currency,
  locale,
}: Props) {
  const t = await getTranslations("recs");
  const fmtParams: Record<string, string | number> = { ...recommendation.params };

  for (const [key, value] of Object.entries(fmtParams)) {
    if (
      typeof value === "number" &&
      (key.includes("redirectable") ||
        key.includes("boost") ||
        key.includes("Avg") ||
        key.includes("amount"))
    ) {
      fmtParams[key] = formatCurrency(value, currency, locale);
    }
  }

  const cta = CTA[recommendation.id];
  const icon = ICONS[recommendation.id] ?? "💡";

  return (
    <div className="flex gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-lg"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">
          {t(recommendation.titleKey)}
        </p>
        <p className="mt-0.5 text-sm text-gray-500">
          {t(recommendation.descriptionKey, fmtParams)}
        </p>
        {cta && (
          <Link
            href={`/${locale}${cta.path}`}
            className="mt-2 inline-block text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            {t(cta.labelKey)}
          </Link>
        )}
      </div>
    </div>
  );
}
