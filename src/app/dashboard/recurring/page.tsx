import { auth } from "@/auth";
import { getRecurringTransactions, cancelRecurring } from "@/modules/transactions/actions";
import { FREQUENCY_LABELS } from "@/modules/transactions/constants";
import { formatCurrency, getNextOccurrenceDate } from "@/lib/utils";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import Link from "next/link";
import type { Account, Category, Transaction } from "@prisma/client";

type TxWithRels = Transaction & { account: Account; category: Category | null };

function RecurringCard({ tx, currency, locale }: { tx: TxWithRels; currency: string; locale: string }) {
  const nextDate = tx.frequency
    ? getNextOccurrenceDate(
        new Date(tx.date),
        tx.frequency,
        tx.recurrenceEnd,
      )
    : null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Clickable area — navigates to edit */}
      <a
        href={`/dashboard/transactions/${tx.id}/edit`}
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
              {tx.frequency && ` · ${FREQUENCY_LABELS[tx.frequency]}`}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p
              className={`font-bold ${
                tx.type === "INCOME" ? "text-green-600" : "text-red-500"
              }`}
            >
              {tx.type === "EXPENSE" ? "-" : "+"}
              {formatCurrency(Number(tx.amount), currency, locale)}
            </p>
            {nextDate && (
              <p className="text-xs text-gray-400 mt-0.5">
                Next:{" "}
                {nextDate.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </p>
            )}
            {!nextDate && tx.recurrenceEnd && (
              <p className="text-xs text-gray-400 mt-0.5">Ended</p>
            )}
          </div>
        </div>
      </a>

      {/* Footer — stop recurring */}
      <div className="flex items-center px-4 pb-4 pt-3 border-t border-gray-50">
        <form
          action={async () => {
            "use server";
            await cancelRecurring(tx.id);
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
  const [session, transactions] = await Promise.all([
    auth(),
    getRecurringTransactions(),
  ]);

  const currency = session?.user?.defaultCurrency ?? "BRL";
  const locale = session?.user?.locale ?? "pt-BR";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Recurring</h1>
        <p className="mt-0.5 text-sm text-gray-400">Transactions set to repeat automatically.</p>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No recurring transactions</p>
          <p className="mt-1 text-sm text-gray-400">
            Toggle &ldquo;Repeat this transaction&rdquo; when adding a transaction.
          </p>
          <Link
            href="/dashboard/transactions/new"
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add transaction
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <RecurringCard key={tx.id} tx={tx} currency={currency} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

