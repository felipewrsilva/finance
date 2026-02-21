import { auth } from "@/auth";
import { getRecurringRules, cancelRecurring } from "@/modules/transactions/actions";
import { FREQUENCY_LABELS, TRANSACTION_TYPE_COLORS } from "@/modules/transactions/constants";
import { formatCurrency, getNextOccurrenceDate, formatDate } from "@/lib/utils";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import Link from "next/link";
import type { RecurringRuleWithRels } from "@/modules/transactions/actions";
import type { Frequency } from "@prisma/client";

const TYPE_SIGN: Record<string, string> = {
  INCOME: "+",
  EXPENSE: "−",
  TRANSFER: "⇄",
  INVESTMENT: "📈 ",
};

function RuleCard({ rule, currency, locale }: { rule: RecurringRuleWithRels; currency: string; locale: string }) {
  const nextDate = getNextOccurrenceDate(
    new Date(rule.lastGeneratedDate ?? rule.startDate),
    rule.frequency as Frequency,
    rule.endDate,
  );

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl shrink-0">
            {rule.category?.icon ?? (rule.type === "TRANSFER" ? "↔️" : rule.type === "INVESTMENT" ? "📈" : "🔄")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {rule.description || rule.category?.name || "Recurring"}
            </p>
            <p className="text-xs text-gray-400">
              {rule.account.name} · {FREQUENCY_LABELS[rule.frequency as Frequency]}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className={`font-bold ${TRANSACTION_TYPE_COLORS[rule.type]}`}>
              {TYPE_SIGN[rule.type]}
              {formatCurrency(rule.amount, currency, locale)}
            </p>
            {nextDate ? (
              <p className="text-xs text-gray-400 mt-0.5">
                Next: {formatDate(nextDate, locale, { day: "2-digit", month: "short" })}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-0.5">Ended</p>
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
            label="Stop recurring"
            confirmLabel="Yes, stop"
            cancelLabel="Keep"
          />
        </form>
      </div>
    </div>
  );
}

export default async function RecurringPage() {
  const [session, rules] = await Promise.all([
    auth(),
    getRecurringRules(),
  ]);

  const currency = session?.user?.defaultCurrency ?? "BRL";
  const locale = session?.user?.locale ?? "pt-BR";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Recurring</h1>
        <p className="mt-0.5 text-sm text-gray-400">Active rules that generate transactions automatically.</p>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No recurring rules</p>
          <p className="mt-1 text-sm text-gray-400">
            Toggle &ldquo;Repeat this transaction&rdquo; when adding a transaction.
          </p>
          <Link
            href={`/${locale}/dashboard/transactions/new`}
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add transaction
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} currency={currency} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
