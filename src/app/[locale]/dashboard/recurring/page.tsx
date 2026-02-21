import { auth } from "@/auth";
import { getRecurringRules, cancelRecurring } from "@/modules/transactions/actions";
import { TRANSACTION_TYPE_COLORS } from "@/modules/transactions/constants";
import { formatCurrency, getNextOccurrenceDate, formatDate } from "@/lib/utils";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { RecurringRuleWithRels } from "@/modules/transactions/actions";
import type { Frequency } from "@prisma/client";

const TYPE_SIGN: Record<string, string> = {
  INCOME: "+",
  EXPENSE: "−",
  TRANSFER: "⇄",
  INVESTMENT: "📈 ",
};

type Props = { params: Promise<{ locale: string }> };

export default async function RecurringPage({ params }: Props) {
  const { locale } = await params;
  const [session, rules, t, tc, tf] = await Promise.all([
    auth(),
    getRecurringRules(),
    getTranslations("recurring"),
    getTranslations("common"),
    getTranslations("frequency"),
  ]);

  const currency = session?.user?.defaultCurrency ?? "BRL";
  const userLocale = session?.user?.locale ?? locale;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-0.5 text-sm text-gray-400">{t("subtitle")}</p>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">{t("noRecurring")}</p>
          <p className="mt-1 text-sm text-gray-400">{t("noRecurringHint")}</p>
          <Link
            href={`/${locale}/dashboard/transactions/new`}
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t("addTransaction")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule: RecurringRuleWithRels) => {
            const nextDate = getNextOccurrenceDate(
              new Date(rule.lastGeneratedDate ?? rule.startDate),
              rule.frequency as Frequency,
              rule.endDate,
            );

            return (
              <div key={rule.id} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl shrink-0">
                      {rule.category?.icon ?? (rule.type === "TRANSFER" ? "↔️" : rule.type === "INVESTMENT" ? "📈" : "🔄")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {rule.description || rule.category?.name || t("noRecurring")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {rule.account.name} · {tf(rule.frequency as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold ${TRANSACTION_TYPE_COLORS[rule.type]}`}>
                        {TYPE_SIGN[rule.type]}
                        {formatCurrency(rule.amount, currency, userLocale)}
                      </p>
                      {nextDate ? (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {t("next")}{" "}
                          {formatDate(nextDate, userLocale, { day: "2-digit", month: "short" })}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-0.5">{tc("ended")}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center px-4 pb-4 pt-3 border-t border-gray-50">
                  <form
                    action={async () => {
                      "use server";
                      await cancelRecurring(rule.id);
                    }}
                  >
                    <InlineConfirmButton
                      label={tc("stop_recurring")}
                      confirmLabel={tc("yes_stop")}
                      cancelLabel={tc("keep")}
                    />
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
