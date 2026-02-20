"use client";

import { AccountType } from "@prisma/client";
import { deleteAccount } from "@/modules/accounts/actions";
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
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: account.color ?? "#6366f1" + "20" }}
        >
          {ACCOUNT_TYPE_ICONS[account.type]}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{account.name}</p>
          <p className="text-xs text-gray-500">
            {ACCOUNT_TYPE_LABELS[account.type]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={`text-sm font-semibold ${
            balance >= 0 ? "text-gray-900" : "text-red-600"
          }`}
        >
          {formatted}
        </span>

        <div className="flex gap-1">
          <a
            href={`/dashboard/accounts/${account.id}/edit`}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            title="Edit"
          >
            ✏️
          </a>
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Archive this account?")) return;
              await deleteAccount(account.id);
            }}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
