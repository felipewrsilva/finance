"use client";

import { useRef, useState, useEffect, useMemo } from "react";

// ─── Formatter Cache ──────────────────────────────────────────────────────────

const formatterCache = new Map<string, Intl.NumberFormat>();

function getCachedFormatter(
  locale: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, options));
  }
  return formatterCache.get(key)!;
}

// ─── Currency Symbol ──────────────────────────────────────────────────────────

function getCurrencySymbol(currency: string, locale: string): string {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).formatToParts(0);
  return parts.find((p) => p.type === "currency")?.value ?? currency;
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface CurrencyInputProps {
  /** Name for the hidden numeric form field. */
  name: string;
  /** Controlled decimal value, e.g. 12.34. Use 0 for empty / new. */
  value: number;
  /** ISO 4217 currency code, e.g. "BRL", "USD". */
  currency: string;
  /** BCP 47 locale string, e.g. "pt-BR", "en-US". */
  locale: string;
  /** Called with the new decimal value on every change. */
  onChange: (value: number) => void;
  /** When provided and has >1 entry, an inline currency selector is shown. */
  availableCurrencies?: string[];
  /** Called when the user picks a different currency in the inline selector. */
  onCurrencyChange?: (currency: string) => void;
  /** Kept for API compatibility. The formatted "0,00" acts as the implicit placeholder. */
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function CurrencyInput({
  name,
  value,
  currency,
  locale,
  onChange,
  availableCurrencies,
  onCurrencyChange,
  required,
  className,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const symbol = useMemo(
    () => getCurrencySymbol(currency, locale),
    [currency, locale],
  );
  const showSelector = (availableCurrencies?.length ?? 0) > 1;

  // ── Internal state: integer cents ───────────────────────────────────────────────
  // Value is stored as integer cents (e.g. 12.34 → 1234). The display string
  // is always rebuilt from that buffer — no decimal-string parsing, no cursor
  // arithmetic. Typing feels like an ATM: digits shift in from the right,
  // two decimal places are always visible, and input never blocks.
  const [cents, setCents] = useState(() => Math.round((value || 0) * 100));

  // Sync when the parent value changes while the field is not focused.
  useEffect(() => {
    if (!isFocused) {
      setCents(Math.round((value || 0) * 100));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isFocused]);

  // Always show exactly 2 decimal places.
  const displayValue = useMemo(
    () =>
      getCachedFormatter(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(cents / 100),
    [cents, locale],
  );

  // Keep cursor at the end whenever the displayed value changes while focused.
  useEffect(() => {
    if (isFocused && inputRef.current) {
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [displayValue, isFocused]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip everything except digits — the decimal separator is implicit.
    const digits = e.target.value.replace(/\D/g, "");
    const newCents = digits ? parseInt(digits, 10) : 0;

    // If the new value equals the current state (e.g. backspace on "0,00"),
    // React won’t re-render. Manually reset the DOM to stay in sync.
    if (newCents === cents) {
      e.target.value = displayValue;
      e.target.setSelectionRange(displayValue.length, displayValue.length);
      return;
    }

    setCents(newCents);
    onChange(newCents / 100);
  }

  function handleFocus() {
    setIsFocused(true);
    // Position cursor at the end so digits accumulate naturally from the right.
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    });
  }

  function handleBlur() {
    setIsFocused(false);
  }

  return (
    <div
      className={`flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-indigo-500 ${className ?? ""}`}
    >
      {showSelector ? (
        <>
          {/* Currency selector — left section of compound input */}
          <div className="relative shrink-0">
            <select
              value={currency}
              onChange={(e) => onCurrencyChange?.(e.target.value)}
              aria-label="Currency"
              className="h-full cursor-pointer appearance-none bg-transparent py-3 pl-4 pr-7 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50/60 focus:outline-none"
            >
              {availableCurrencies!.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {/* Dropdown chevron */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Vertical divider */}
          <div className="w-px self-stretch bg-gray-900/10" aria-hidden="true" />

          {/* Numeric input — right section */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base focus:outline-none"
          />
        </>
      ) : (
        <>
          {/* Currency symbol — single-currency mode */}
          <span className="shrink-0 select-none pl-4 text-sm text-gray-400">
            {symbol}
          </span>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            className="min-w-0 flex-1 bg-transparent py-3 pl-2 pr-4 text-base focus:outline-none"
          />
        </>
      )}

      {/* Hidden input carries the decimal value for server-action form submission. */}
      <input type="hidden" name={name} value={cents > 0 ? (cents / 100).toFixed(2) : ""} />
    </div>
  );
}
