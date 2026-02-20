"use client";

import Image from "next/image";
import { AccountType } from "@prisma/client";
import { useRef, useState } from "react";
import { createAccount, updateAccount } from "@/modules/accounts/actions";
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_COLORS,
  BANKS,
  type BankKey,
} from "@/modules/accounts/constants";
import { CurrencyInput } from "@/components/ui/currency-input";

type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: string | number;
  color: string | null;
  isDefault: boolean;
  bankKey: string | null;
};

type Props = {
  account?: Account;
  currency?: string;
  locale?: string;
};

export function AccountForm({ account, currency = "BRL", locale = "pt-BR" }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const isEdit = !!account;

  const [balance, setBalance] = useState(
    account ? Number(account.balance) : 0
  );

  const [selectedBank, setSelectedBank] = useState<BankKey | null>(
    (account?.bankKey as BankKey | null) ?? null,
  );

  const action = isEdit
    ? updateAccount.bind(null, account.id)
    : createAccount;

  function handleBankClick(key: BankKey, label: string) {
    if (selectedBank === key) {
      setSelectedBank(null);
      return;
    }
    setSelectedBank(key);
    // Auto-fill name only when the field is blank
    if (nameRef.current && nameRef.current.value.trim() === "") {
      nameRef.current.value = label;
    }
  }

  return (
    <form ref={formRef} action={action} className="space-y-5">
      {/* Hidden bank fields */}
      <input type="hidden" name="bankKey" value={selectedBank ?? ""} />
      <input
        type="hidden"
        name="bankName"
        value={selectedBank ? (BANKS.find((b) => b.key === selectedBank)?.label ?? "") : ""}
      />

      {/* Bank selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bank <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="grid grid-cols-5 gap-2">
          {BANKS.map((bank) => {
            const isSelected = selectedBank === bank.key;
            return (
              <button
                key={bank.key}
                type="button"
                onClick={() => handleBankClick(bank.key, bank.label)}
                title={bank.label}
                className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="relative h-8 w-8">
                  <Image
                    src={bank.logoPath}
                    alt={bank.label}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[10px] text-gray-600 leading-tight text-center">
                  {bank.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account name
        </label>
        <input
          ref={nameRef}
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
        <CurrencyInput
          name="balance"
          value={balance}
          currency={currency}
          locale={locale}
          onChange={setBalance}
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
