"use client";

import { AccountType } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { ACCOUNT_TYPE_TOKENS } from "@/modules/accounts/constants";
import { formatCurrency } from "@/lib/utils";
import { AccountActionsDropdown } from "./account-actions-dropdown";

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
};

export function AccountCard({ account, currency }: Props) {
  const locale = useLocale();
  const ta = useTranslations("accounts");
  const balance = Number(account.balance);
  const formatted = formatCurrency(balance, currency, locale);
  const tokens = ACCOUNT_TYPE_TOKENS[account.type];

  const typeLabel: Record<AccountType, string> = {
    CASH: ta("typeCash"),
    CHECKING: ta("typeChecking"),
    BANK: ta("typeBank"),
    CREDIT_CARD: ta("typeCreditCard"),
    INVESTMENT: ta("typeInvestment"),
  };

  return (
    <div className="group flex items-center overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
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

      {/* Actions — outside the link to avoid nested interactivity */}
      <div className="px-2 shrink-0">
        <AccountActionsDropdown accountId={account.id} locale={locale} />
      </div>
    </div>
  );
}
