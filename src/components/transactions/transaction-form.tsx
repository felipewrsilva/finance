"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createTransaction, updateTransaction } from "@/modules/transactions/actions";
import { TypeToggle } from "@/components/ui/type-toggle";
import { RecurringSection } from "@/components/ui/recurring-section";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { SubmitButton } from "@/components/ui/submit-button";
import { shouldRenderSelector } from "@/lib/utils";
import type { Account, Category, Transaction } from "@prisma/client";

interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
  transaction?: Transaction;
  defaultType?: "INCOME" | "EXPENSE";
  userCurrencies?: string[];
  defaultCurrency?: string;
  /** User's preferred locale for currency formatting (from DB). */
  locale?: string;
}

export function TransactionForm({
  accounts,
  categories,
  transaction,
  defaultType = "EXPENSE",
  userCurrencies = [],
  defaultCurrency = "BRL",
  locale: serverLocale = "pt-BR",
}: TransactionFormProps) {
  const router = useRouter();
  const t = useTranslations("form");

  const [type, setType] = useState<"INCOME" | "EXPENSE" | "TRANSFER">(
    (transaction?.type as "INCOME" | "EXPENSE" | "TRANSFER") ?? defaultType
  );
  const [accountId, setAccountId] = useState(
    transaction?.accountId ?? (accounts.length === 1 ? accounts[0].id : "")
  );
  const [status, setStatus] = useState<"PAID" | "PENDING">(
    transaction?.status ?? "PAID"
  );
  const [currency, setCurrency] = useState(
    transaction?.currency ?? defaultCurrency
  );
  const [amount, setAmount] = useState(
    transaction?.amount ? Number(transaction.amount) : 0
  );
  const [destAccountId, setDestAccountId] = useState<string>(
    (transaction?.metadata as { destinationAccountId?: string } | null)
      ?.destinationAccountId ?? ""
  );

  const txDate = transaction
    ? new Date(transaction.date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(txDate);

  // Derive the effective currency list — always has at least the defaultCurrency.
  const availableCurrencies =
    userCurrencies.length > 0 ? userCurrencies : [defaultCurrency];

  // Load persisted preferences only for new transactions
  useEffect(() => {
    if (!transaction) {
      const savedType = localStorage.getItem("lastTxType") as "INCOME" | "EXPENSE" | null;
      if (savedType === "INCOME" || savedType === "EXPENSE") setType(savedType);

      const savedAccountId = localStorage.getItem("lastTxAccountId");
      if (savedAccountId && accounts.some((a) => a.id === savedAccountId)) {
        setAccountId(savedAccountId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTypeChange(newType: "INCOME" | "EXPENSE" | "TRANSFER") {
    setType(newType);
    if (newType !== "TRANSFER") localStorage.setItem("lastTxType", newType);
  }

  function handleAccountChange(id: string) {
    setAccountId(id);
    localStorage.setItem("lastTxAccountId", id);
  }

  const action = transaction
    ? updateTransaction.bind(null, transaction.id)
    : createTransaction;

  const filteredCategories = categories.filter((c) => c.type === type);
  const showAccountSelector = shouldRenderSelector(accounts);

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <form action={action} className="space-y-5">
      {/* Controlled hidden inputs for server action */}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="accountId" value={accountId || (accounts[0]?.id ?? "")} />
      <input type="hidden" name="status" value={type === "TRANSFER" ? "PAID" : status} />
      {type === "TRANSFER" && destAccountId && (
        <input type="hidden" name="destinationAccountId" value={destAccountId} />
      )}

      {/* Type — segmented control */}
      <TypeToggle value={type} onChange={handleTypeChange} />

      {/* Amount + currency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t("amount")}</label>
        <CurrencyInput
          name="amount"
          value={amount}
          currency={currency}
          locale={serverLocale}
          onChange={setAmount}
          availableCurrencies={availableCurrencies}
          onCurrencyChange={setCurrency}
          required
        />
        <input type="hidden" name="currency" value={currency} />
      </div>

      {/* Account — only when multiple accounts exist */}
      {showAccountSelector && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {type === "TRANSFER" ? t("fromAccount") : t("account")}
          </label>
          <select
            value={accountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            required
            className={inputCls}
          >
            <option value="">{t("selectAccount")}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Destination account — TRANSFER only */}
      {type === "TRANSFER" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("toAccount")}</label>
          <select
            value={destAccountId}
            onChange={(e) => setDestAccountId(e.target.value)}
            required
            className={inputCls}
          >
            <option value="">{t("selectDestAccount")}</option>
            {accounts
              .filter((a) => a.id !== accountId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Category — hidden for TRANSFER */}
      {type !== "TRANSFER" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("category")}</label>
          {filteredCategories.length === 1 ? (
            <>
              <input type="hidden" name="categoryId" value={filteredCategories[0].id} />
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {filteredCategories[0].icon && (
                  <span>{filteredCategories[0].icon}</span>
                )}
                <span>{filteredCategories[0].name}</span>
                <span className="ml-auto text-xs text-gray-400">{t("autoSelected")}</span>
              </div>
            </>
          ) : (
            <select
              name="categoryId"
              defaultValue={transaction?.categoryId ?? ""}
              required
              className={inputCls}
            >
              <option value="">{t("selectCategory")}</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon ? `${c.icon} ` : ""}
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t("date")}</label>
        <DatePicker name="date" value={date} onChange={setDate} required />
      </div>

      {/* Status — segmented control, hidden for TRANSFER */}
      {type !== "TRANSFER" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("status")}</label>
          <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
            {(["PAID", "PENDING"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${
                  status === s
                    ? s === "PAID"
                      ? "bg-white shadow-sm text-green-600"
                      : "bg-white shadow-sm text-amber-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s === "PAID" ? t("paid") : t("pending")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("description")}{" "}
          <span className="text-gray-400 font-normal">{t("optional")}</span>
        </label>
        <input
          name="description"
          type="text"
          defaultValue={transaction?.description ?? ""}
          placeholder={t("descriptionPlaceholder")}
          className={inputCls}
        />
      </div>

      {/* Recurring section — hidden for TRANSFER */}
      {type !== "TRANSFER" && (
        <RecurringSection
          defaultIsRecurring={transaction?.isRecurring ?? false}
          defaultFrequency={transaction?.frequency ?? "MONTHLY"}
          defaultRecurrenceEnd={transaction?.recurrenceEnd ?? null}
        />
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <SubmitButton
          className="flex-1 rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800"
        >
          {transaction ? t("saveChanges") : t("addTransaction")}
        </SubmitButton>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

