"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  addUserCurrency,
  removeUserCurrency,
  updateDefaultCurrency,
} from "@/modules/currencies/actions";
import { CurrencyRow } from "@/components/settings/currency-row";
import type { SUPPORTED_CURRENCIES } from "@/modules/currencies/constants";

type CurrencyMeta = (typeof SUPPORTED_CURRENCIES)[number];

interface CurrencyListProps {
  /** Currently enabled currency codes, default-first. */
  enabledCodes: string[];
  defaultCurrency: string;
  allCurrencies: readonly CurrencyMeta[];
}

export function CurrencyList({
  enabledCodes,
  defaultCurrency,
  allCurrencies,
}: CurrencyListProps) {
  const [enabled, setEnabled] = useState(enabledCodes);
  const [defaultCode, setDefaultCode] = useState(defaultCurrency);
  const [showPicker, setShowPicker] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("settings");

  const available = allCurrencies.filter((c) => !enabled.includes(c.code));

  function getMeta(code: string): CurrencyMeta {
    return (
      allCurrencies.find((c) => c.code === code) ?? {
        code,
        flag: "🌐",
        name: code,
        label: code,
      }
    ) as CurrencyMeta;
  }

  function handleMakeDefault(code: string) {
    // Optimistic update
    setDefaultCode(code);
    // Ensure the new default is in the list
    setEnabled((prev) => (prev.includes(code) ? prev : [code, ...prev]));

    const fd = new FormData();
    fd.set("currency", code);
    startTransition(() => {
      updateDefaultCurrency(fd);
    });
  }

  function handleRemove(code: string) {
    // Optimistic update
    setEnabled((prev) => prev.filter((c) => c !== code));

    const fd = new FormData();
    fd.set("currency", code);
    startTransition(() => {
      removeUserCurrency(fd);
    });
  }

  function handleAdd(code: string) {
    if (!code) return;
    // Optimistic update
    setEnabled((prev) => [...prev, code]);
    setShowPicker(false);

    const fd = new FormData();
    fd.set("currency", code);
    startTransition(() => {
      addUserCurrency(fd);
    });
  }

  return (
    <div>
      <ul className={`transition-opacity ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {enabled.map((code) => {
          const meta = getMeta(code);
          return (
            <CurrencyRow
              key={code}
              code={code}
              name={meta.name}
              flag={meta.flag}
              isDefault={code === defaultCode}
              canRemove={enabled.length > 1}
              onMakeDefault={() => handleMakeDefault(code)}
              onRemove={() => handleRemove(code)}
            />
          );
        })}
      </ul>

      {/* Add currency */}
      <div className="pt-3">
        {showPicker ? (
          <select
            autoFocus
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            defaultValue=""
            onChange={(e) => handleAdd(e.target.value)}
            onBlur={() => setShowPicker(false)}
          >
            <option value="" disabled>
              {t("selectCurrency")}
            </option>
            {available.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.code})
              </option>
            ))}
          </select>
        ) : available.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            {t("addCurrency")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
