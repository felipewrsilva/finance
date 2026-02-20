import { auth } from "@/auth";
import { getRecurringTransactions, cancelRecurring } from "@/modules/transactions/actions";
import { formatCurrency, getNextOccurrenceDate } from "@/lib/utils";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Account, Category, Transaction } from "@prisma/client";
import type { Frequency } from "@prisma/client";

type TxWithRels = Transaction & { account: Account; category: Category | null };

type Props = { params: Promise<{ locale: string }> };

export default async function RecurringPage({ params }: Props) {
  const { locale } = await params;
  const [session, transactions, t, tc] = await Promise.all([
    auth(),
    getRecurringTransactions(),
    getTranslations("recurring"),
    getTranslations("common"),
  ]);

  const currency = session?.user?.defaultCurrency ?? "BRL";
  const userLocale = session?.user?.locale ?? locale;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-0.5 text-sm text-gray-400">{t("subtitle")}</p>
      </div>

      {transactions.length === 0 ? (
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
          {transactions.map((tx) => {
            const nextDate = tx.frequency
              ? getNextOccurrenceDate(new Date(tx.date), tx.frequency as Frequency, tx.recurrenceEnd)
              : null;

            return (
              <div key={tx.id} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                <a
                  href={`/${locale}/dashboard/transactions/${tx.id}/edit`}
                  className="block p-4 transition-colors hover:bg-gray-50/60 active:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl shrink-0">
                      {tx.category?.icon ?? "🔄"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {tx.description || tx.category?.name || "Recurring"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {tx.account.name}
                        {tx.frequency && ` · ${t(`frequency_${tx.frequency}` as never) || tx.frequency}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold ${tx.type === "INCOME" ? "text-green-600" : "text-red-500"}`}>
                        {tx.type === "EXPENSE" ? "-" : "+"}
                        {formatCurrency(Number(tx.amount), currency, userLocale)}
                      </p>
                      {nextDate && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {t("next")}{" "}
                          {new Intl.DateTimeFormat(userLocale, { day: "2-digit", month: "short" }).format(nextDate)}
                        </p>
                      )}
                      {!nextDate && tx.recurrenceEnd && (
                        <p className="text-xs text-gray-400 mt-0.5">{tc("ended")}</p>
                      )}
                    </div>
                  </div>
                </a>

                <div className="flex items-center px-4 pb-4 pt-3 border-t border-gray-50">
                  <form
                    action={async () => {
                      "use server";
                      await cancelRecurring(tx.id);
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
