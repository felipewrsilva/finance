"use client";

import Image from "next/image";
import { AccountType } from "@prisma/client";
import { deleteAccount } from "@/modules/accounts/actions";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_ICONS,
} from "@/modules/accounts/constants";

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
  const balance = Number(account.balance);
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(balance);

  return (
    <div className="flex items-center rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Clickable area — navigates to edit */}
      <a
        href={`/dashboard/accounts/${account.id}/edit`}
        className="flex flex-1 items-center gap-3 p-4 min-w-0 transition-colors hover:bg-gray-50/60 active:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden shrink-0"
          style={{ backgroundColor: account.color ? account.color + "20" : "#6366f120" }}
        >
          {account.bankKey ? (
            <div className="relative h-6 w-6">
              <Image
                src={`/banks/${account.bankKey}.svg`}
                alt={account.name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <span className="text-lg">{ACCOUNT_TYPE_ICONS[account.type]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{account.name}</p>
          <p className="text-xs text-gray-500">{ACCOUNT_TYPE_LABELS[account.type]}</p>
        </div>
        <span
          className={`text-sm font-semibold shrink-0 ml-2 ${
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
          confirmLabel="Yes, delete"
          cancelLabel="Keep"
        />
      </div>
    </div>
  );
}
