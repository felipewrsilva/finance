"use client";

import { AccountType } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { ACCOUNT_TYPE_TOKENS } from "@/modules/accounts/constants";
import { formatCurrency } from "@/lib/utils";
import { deleteAccount } from "@/modules/accounts/actions";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";

type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: string | number;
  color: string | null;
  bankKey: string | null;
};

type Props = {
  account: Account;
  currency: string;
  /** Total number of accounts — used to disable delete on the last account */
  totalAccounts: number;
};

export function AccountCard({ account, currency, totalAccounts }: Props) {
  const locale = useLocale();
  const ta = useTranslations("accounts");
  const tc = useTranslations("common");
  const balance = Number(account.balance);
  const formatted = formatCurrency(balance, currency, locale);
  const tokens = ACCOUNT_TYPE_TOKENS[account.type];
  const canDelete = totalAccounts > 1;

  const typeLabel: Record<AccountType, string> = {
    CASH: ta("typeCash"),
    CHECKING: ta("typeChecking"),
    BANK: ta("typeBank"),
    CREDIT_CARD: ta("typeCreditCard"),
    INVESTMENT: ta("typeInvestment"),
  };

  return (
    <div className="group flex items-center rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Clickable area — navigates to edit */}
      <a
        href={`/${locale}/dashboard/accounts/${account.id}/edit`}
        className="flex flex-1 items-center gap-3.5 p-4 min-w-0 transition-colors hover:bg-gray-50/70 active:bg-gray-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
      >
        {/* Type icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden ${tokens.iconBg}`}
        >
          {account.bankKey ? (
            <img
              src={`/banks/${account.bankKey}.svg`}
              alt=""
              className="h-6 w-6 object-contain"
            />
          ) : (
            <span className="text-lg leading-none" aria-hidden="true">
              {tokens.icon}
            </span>
          )}
        </div>

        {/* Name + type */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{account.name}</p>
          <p className="mt-0.5 text-xs text-gray-500 truncate">{typeLabel[account.type]}</p>
        </div>

        {/* Balance */}
        <span
          className={`shrink-0 text-sm font-semibold tabular-nums ${
            balance >= 0 ? "text-gray-900" : "text-red-600"
          }`}
        >
          {formatted}
        </span>
      </a>

      {/* Delete — matches transaction list pattern */}
      <div className="shrink-0 pr-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {canDelete ? (
          <InlineConfirmButton
            onConfirm={() => deleteAccount(account.id)}
            label={tc("delete")}
            confirmLabel={tc("yes_delete")}
            cancelLabel={tc("keep")}
            showAsText
          />
        ) : (
          <button
            type="button"
            disabled
            title={ta("deleteDisabledHint")}
            className="rounded px-2 py-1 text-xs font-medium text-gray-300 cursor-not-allowed"
          >
            {tc("delete")}
          </button>
        )}
      </div>
    </div>
  );
}
