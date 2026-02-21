"use client";

import { AccountType } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { deleteAccount } from "@/modules/accounts/actions";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import { ACCOUNT_TYPE_ICONS } from "@/modules/accounts/constants";
import { formatCurrency } from "@/lib/utils";

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
  const tc = useTranslations("common");
  const ta = useTranslations("accounts");
  const balance = Number(account.balance);
  const formatted = formatCurrency(balance, currency, locale);
  const typeLabels: Record<AccountType, string> = {
    CASH: ta("typeCash"),
    CHECKING: ta("typeChecking"),
    BANK: ta("typeBank"),
    CREDIT_CARD: ta("typeCreditCard"),
    INVESTMENT: ta("typeInvestment"),
  };

  return (
    <div className="flex items-center rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Clickable area — navigates to edit */}
      <a
        href={`/${locale}/dashboard/accounts/${account.id}/edit`}
        className="flex flex-1 items-center gap-3 p-4 min-w-0 transition-colors hover:bg-gray-50/60 active:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden shrink-0"
          style={{ backgroundColor: account.color ? account.color + "20" : "#6366f120" }}
        >
          {account.bankKey ? (
            <img
              src={`/banks/${account.bankKey}.svg`}
              alt={account.name}
              className="h-6 w-6 object-contain"
            />
          ) : (
            <span className="text-lg">{ACCOUNT_TYPE_ICONS[account.type]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{account.name}</p>
          <p className="text-xs text-gray-500">{typeLabels[account.type]}</p>
        </div>
        <span
          className={`text-sm font-semibold tabular-nums shrink-0 ml-2 ${
            balance >= 0 ? "text-gray-900" : "text-red-600"
          }`}
        >
          {formatted}
        </span>
      </a>

      {/* Delete — outside link to avoid nested interactivity */}
      <div className="pr-3 shrink-0">
        <InlineConfirmButton
          onConfirm={() => deleteAccount(account.id)}
          confirmLabel={tc("yes_delete")}
          cancelLabel={tc("keep")}
        />
      </div>
    </div>
  );
}
