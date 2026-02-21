"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createInvestment, updateInvestment } from "@/modules/investments/actions";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  RECURRENCE_INTERVAL_LABELS,
  COMPOUNDING_LABELS,
  INVESTMENT_STATUS_LABELS,
  PROJECTION_HORIZONS,
} from "@/modules/investments/constants";
import { totalProjectedValue } from "@/modules/investments/projections";
import { formatCurrency } from "@/lib/utils";
import type { InvestmentCategory, Investment, RecurrenceInterval } from "@prisma/client";

type InvestmentWithCategory = Investment & { category: InvestmentCategory };

interface InvestmentFormProps {
  categories: InvestmentCategory[];
  investment?: InvestmentWithCategory;
  userCurrencies?: string[];
  defaultCurrency?: string;
  locale?: string;
}

export function InvestmentForm({
  categories,
  investment,
  userCurrencies = [],
  defaultCurrency = "BRL",
  locale = "pt-BR",
}: InvestmentFormProps) {
  const router = useRouter();
  const t = useTranslations("investments");
  const tf = useTranslations("form");

  const [categoryId, setCategoryId] = useState(investment?.categoryId ?? "");
  const [principal, setPrincipal] = useState(
    investment ? Number(investment.principalAmount) : 0
  );
  const [currency, setCurrency] = useState(investment?.currency ?? defaultCurrency);
  const [rate, setRate] = useState(
    investment ? Number(investment.annualInterestRate) : 0
  );
  const [recurring, setRecurring] = useState(investment?.recurring ?? false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>(
    (investment?.recurrenceInterval as RecurrenceInterval) ?? "MONTHLY"
  );
  const [recurrenceAmount, setRecurrenceAmount] = useState(
    investment?.recurrenceAmount ? Number(investment.recurrenceAmount) : 0
  );
  const [compounding, setCompounding] = useState(
    investment?.compounding ?? "ANNUAL"
  );
  const [status, setStatus] = useState(investment?.status ?? "ACTIVE");
  const [startDate, setStartDate] = useState(
    investment
      ? new Date(investment.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [rateLoading, setRateLoading] = useState(false);

  const availableCurrencies =
    userCurrencies.length > 0 ? userCurrencies : [defaultCurrency];

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-violet-500";

  // Auto-fill rate when category changes (fetch from API)
  useEffect(() => {
    if (!categoryId || investment) return;
    setRateLoading(true);

    fetch(`/api/investments/default-rate?categoryId=${categoryId}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.rate === "number" && data.rate > 0) {
          setRate(data.rate);
        }
      })
      .catch(() => {})
      .finally(() => setRateLoading(false));
  }, [categoryId, investment]);

  const action = investment
    ? updateInvestment.bind(null, investment.id)
    : createInvestment;

  // Projection preview
  const annualRateDecimal = rate / 100;
  const projectionPreview =
    principal > 0 && rate > 0
      ? PROJECTION_HORIZONS.map((h) => ({
          years: h,
          value: totalProjectedValue(
            principal,
            annualRateDecimal,
            h,
            recurring && recurrenceAmount > 0 ? recurrenceAmount : 0,
            recurring ? recurrenceInterval : null
          ),
        }))
      : null;

  return (
    <form action={action} className="space-y-5">
      {/* Hidden fields */}
      <input type="hidden" name="currency" value={currency} />
      <input type="hidden" name="recurring" value={String(recurring)} />
      <input type="hidden" name="compounding" value={compounding} />
      <input type="hidden" name="status" value={status} />

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("category")}
        </label>
        <select
          name="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className={inputCls}
        >
          <option value="">{t("selectCategory")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Principal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("principal")}
        </label>
        <CurrencyInput
          name="principalAmount"
          value={principal}
          currency={currency}
          locale={locale}
          onChange={setPrincipal}
          availableCurrencies={availableCurrencies}
          onCurrencyChange={setCurrency}
          required
        />
      </div>

      {/* Start date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("startDate")}
        </label>
        <DatePicker name="startDate" value={startDate} onChange={setStartDate} required />
      </div>

      {/* Annual interest rate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          {t("annualRate")}
          {rateLoading && (
            <span className="text-xs text-gray-400">{t("loadingRate")}</span>
          )}
        </label>
        <div className="relative">
          <input
            name="annualInterestRate"
            type="number"
            step="0.01"
            min="0.01"
            max="999"
            value={rate || ""}
            onChange={(e) => setRate(Number(e.target.value))}
            placeholder="e.g. 12.50"
            required
            className={inputCls + " pr-10"}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            % /yr
          </span>
        </div>
      </div>

      {/* Compounding */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("compounding")}
        </label>
        <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
          {(["ANNUAL", "DAILY"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCompounding(c)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                compounding === c
                  ? "bg-white shadow-sm text-violet-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {COMPOUNDING_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Recurring toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="relative inline-flex h-6 w-11">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="peer sr-only"
            />
            <span className="absolute inset-0 rounded-full bg-gray-200 transition peer-checked:bg-violet-600" />
            <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
          <span className="text-sm font-medium text-gray-700">{t("recurring")}</span>
        </label>
      </div>

      {/* Recurring fields */}
      {recurring && (
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("recurrenceInterval")}
            </label>
            <select
              name="recurrenceInterval"
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(e.target.value as RecurrenceInterval)}
              className={inputCls}
            >
              {(Object.keys(RECURRENCE_INTERVAL_LABELS) as RecurrenceInterval[]).map((k) => (
                <option key={k} value={k}>
                  {RECURRENCE_INTERVAL_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("recurrenceAmount")}
            </label>
            <CurrencyInput
              name="recurrenceAmount"
              value={recurrenceAmount}
              currency={currency}
              locale={locale}
              onChange={setRecurrenceAmount}
              availableCurrencies={[currency]}
              onCurrencyChange={() => {}}
            />
          </div>
        </div>
      )}

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("status")}</label>
        <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
          {(["ACTIVE", "COMPLETED", "CANCELED"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                status === s
                  ? s === "ACTIVE"
                    ? "bg-white shadow-sm text-emerald-600"
                    : s === "COMPLETED"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "bg-white shadow-sm text-gray-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {INVESTMENT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("notes")}{" "}
          <span className="text-gray-400 font-normal">{tf("optional")}</span>
        </label>
        <input
          name="notes"
          type="text"
          defaultValue={investment?.notes ?? ""}
          placeholder={t("notesPlaceholder")}
          className={inputCls}
        />
      </div>

      {/* Projection preview */}
      {projectionPreview && (
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 mb-3">
            {t("projectionPreview")}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {projectionPreview.map(({ years, value }) => (
              <div key={years} className="text-center">
                <p className="text-xs text-gray-500">{years}y</p>
                <p className="text-sm font-semibold text-violet-700 tabular-nums">
                  {formatCurrency(value, currency, locale)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <SubmitButton className="flex-1 rounded-xl bg-violet-600 py-3 text-base font-semibold text-white hover:bg-violet-700 active:bg-violet-800">
          {investment ? tf("saveChanges") : t("addInvestment")}
        </SubmitButton>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
        >
          {tf("cancel")}
        </button>
      </div>
    </form>
  );
}
