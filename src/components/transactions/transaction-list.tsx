"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { deleteTransaction } from "@/modules/transactions/actions";
import { TRANSACTION_TYPE_COLORS } from "@/modules/transactions/constants";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import { MarkPaidButton } from "./mark-paid-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction, Account, Category } from "@prisma/client";

type TransactionWithRels = Transaction & { account: Account; category: Category | null };

interface TransactionListProps {
  transactions: TransactionWithRels[];
  currency?: string;
  locale?: string;
}

export function TransactionList({ transactions, currency = "BRL", locale: localeProp = "pt-BR" }: TransactionListProps) {
  const t = useTranslations("transactions");
  const tc = useTranslations("common");
  const locale = useLocale() || localeProp;
  const pathname = usePathname();

  // Derive locale prefix from pathname (e.g. /pt-BR/dashboard → pt-BR)
  const localePrefix = pathname.split("/")[1] ?? locale;

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
        <p className="text-4xl mb-3" aria-hidden="true">💸</p>
        <p className="font-medium text-gray-600">{t("noTransactions")}</p>
        <p className="text-sm mt-1 mb-5 text-gray-400">{t("addFirst")}</p>
        <Link
          href={`/${localePrefix}/dashboard/transactions/new`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {t("addTransaction")}
        </Link>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
      aria-label="Transactions"
      role="list"
    >
      {transactions.map((tx, i) => {
        const isPending = tx.status === "PENDING";
        const sign = tx.type === "EXPENSE" ? "−" : tx.type === "INCOME" ? "+" : "";
        const dateStr = formatDate(new Date(tx.date), locale, {
          day: "2-digit",
          month: "short",
        });
        const label =
          tx.description ||
          tx.category?.name ||
          (tx.type === "TRANSFER" ? tc("transfer") : tc("transaction"));

        return (
          <div
            key={tx.id}
            role="listitem"
            className={`group flex items-center transition-colors hover:bg-gray-50/70 ${
              i !== transactions.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            {/* Clickable area */}
            <Link
              href={`/${localePrefix}/dashboard/transactions/${tx.id}/edit`}
              className="flex flex-1 min-w-0 items-center gap-3 px-4 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
            >
              {/* Category icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg">
                {tx.type === "TRANSFER" ? "↔️" : (tx.category?.icon ?? "📌")}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-medium text-gray-900">{label}</p>
                  {tx.isRecurring && (
                    <span
                      title={tc("recurring")}
                      className="shrink-0 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-500"
                    >
                      ↻
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="truncate">
                    {tx.account.name} · {dateStr}
                  </span>
                  {isPending && (
                    <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                      {tc("pending")}
                    </span>
                  )}
                </div>
              </div>

              {/* Amount */}
              <span
                className={`w-24 shrink-0 text-right text-sm font-semibold tabular-nums sm:w-28 ${TRANSACTION_TYPE_COLORS[tx.type]}`}
              >
                {sign}{formatCurrency(Number(tx.amount), currency, locale)}
              </span>
            </Link>

            {/* Mark paid */}
            {isPending && (
              <div className="shrink-0 pr-1">
                <MarkPaidButton id={tx.id} />
              </div>
            )}

            {/* Delete — text button, fades in on hover */}
            <div className="shrink-0 pr-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <InlineConfirmButton
                onConfirm={() => deleteTransaction(tx.id)}
                label={tc("delete")}
                confirmLabel={tc("yes_delete")}
                cancelLabel={tc("keep")}
                showAsText
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
