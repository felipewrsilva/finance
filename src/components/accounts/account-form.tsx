"use client";

import { AccountType } from "@prisma/client";
import { useRef } from "react";
import { createAccount, updateAccount } from "@/modules/accounts/actions";
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_COLORS,
} from "@/modules/accounts/constants";

type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: string | number;
  color: string | null;
  isDefault: boolean;
};

type Props = {
  account?: Account;
};

export function AccountForm({ account }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!account;

  const action = isEdit
    ? updateAccount.bind(null, account.id)
    : createAccount;

  return (
    <form ref={formRef} action={action} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account name
        </label>
        <input
          name="name"
          defaultValue={account?.name}
          required
          placeholder="e.g. Nubank, Wallet"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          name="type"
          defaultValue={account?.type ?? "BANK"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Balance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current balance
        </label>
        <input
          name="balance"
          type="number"
          step="0.01"
          defaultValue={account ? Number(account.balance) : 0}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {ACCOUNT_COLORS.map((color) => (
            <label key={color} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={
                  account?.color === color ||
                  (!account?.color && color === ACCOUNT_COLORS[0])
                }
                className="sr-only"
              />
              <span
                className="block h-7 w-7 rounded-full ring-2 ring-transparent ring-offset-2 transition has-[:checked]:ring-gray-900"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Default account */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          value="true"
          defaultChecked={account?.isDefault ?? false}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
          Set as default account
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          {isEdit ? "Save changes" : "Create account"}
        </button>
        <a
          href="/dashboard/accounts"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
