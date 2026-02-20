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

// ─── Locale Helpers ───────────────────────────────────────────────────────────

function getDecimalSeparator(locale: string): string {
  const parts = new Intl.NumberFormat(locale).formatToParts(1.1);
  return parts.find((p) => p.type === "decimal")?.value ?? ".";
}

function getGroupingSeparator(locale: string): string {
  const parts = new Intl.NumberFormat(locale).formatToParts(1000);
  return parts.find((p) => p.type === "group")?.value ?? ",";
}

function getCurrencySymbol(currency: string, locale: string): string {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).formatToParts(0);
  return parts.find((p) => p.type === "currency")?.value ?? currency;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

function parseSignificant(
  significant: string,
  decimalSep: string,
  groupSep: string,
): number {
  if (!significant) return 0;
  const withoutGroup = significant.split(groupSep).join("");
  const normalized =
    decimalSep !== "." ? withoutGroup.replace(decimalSep, ".") : withoutGroup;
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

// ─── Display Formatting ───────────────────────────────────────────────────────

/** Format the "significant" string (digits + at most one decimal sep) for display.
 *  Integer part gets locale grouping; decimal part is preserved as-is (up to 2 digits). */
function formatSignificant(
  significant: string,
  decimalSep: string,
  locale: string,
): string {
  if (!significant) return "";
  const hasDec = significant.includes(decimalSep);
  const [intPart, decPart = ""] = significant.split(decimalSep);
  const intNum = parseInt(intPart || "0", 10);
  const intFormatter = getCachedFormatter(locale, {
    style: "decimal",
    maximumFractionDigits: 0,
  });
  const intFormatted = intFormatter.format(isNaN(intNum) ? 0 : intNum);
  if (!hasDec) return intFormatted;
  return `${intFormatted}${decimalSep}${decPart.slice(0, 2)}`;
}

/** Convert a raw number to a fully formatted display string. Returns "" for 0. */
function numericToDisplay(value: number, locale: string): string {
  if (value === 0) return "";
  return getCachedFormatter(locale, {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ─── Cursor Tracking ──────────────────────────────────────────────────────────

/** After reformatting, find the new cursor position by counting significant
 *  characters (digits + decimal sep) up to sigCountBefore. */
function getNewCursorPosition(
  formatted: string,
  sigCountBefore: number,
  decimalSep: string,
): number {
  let sigCount = 0;
  for (let i = 0; i < formatted.length; i++) {
    const ch = formatted[i];
    if (/\d/.test(ch) || ch === decimalSep) {
      sigCount++;
      if (sigCount === sigCountBefore) return i + 1;
    }
  }
  return formatted.length;
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface CurrencyInputProps {
  /** Name for the hidden numeric form field. */
  name: string;
  /** Controlled numeric value (use 0 for empty / new). */
  value: number;
  /** ISO 4217 currency code, e.g. "BRL", "USD". */
  currency: string;
  /** BCP 47 locale string, e.g. "pt-BR", "en-US". */
  locale: string;
  /** Called with the new raw numeric value on every change. */
  onChange: (value: number) => void;
  /** When provided and has >1 entry, an inline currency selector is shown. */
  availableCurrencies?: string[];
  /** Called when the user picks a different currency in the inline selector. */
  onCurrencyChange?: (currency: string) => void;
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
  placeholder,
  required,
  className,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCursorRef = useRef<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const decimalSep = useMemo(() => getDecimalSeparator(locale), [locale]);
  const groupSep = useMemo(() => getGroupingSeparator(locale), [locale]);
  const symbol = useMemo(
    () => getCurrencySymbol(currency, locale),
    [currency, locale],
  );
  const showSelector = (availableCurrencies?.length ?? 0) > 1;

  const defaultPlaceholder = useMemo(
    () => `0${decimalSep}00`,
    [decimalSep],
  );

  const [displayValue, setDisplayValue] = useState(() =>
    numericToDisplay(value, locale),
  );

  // Sync display when value / locale / currency changes while not focused
  // (e.g., parent loads data or user switches currency).
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(numericToDisplay(value, locale));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, locale, currency]);

  // Restore cursor position after React updates the input value.
  useEffect(() => {
    if (pendingCursorRef.current !== null && inputRef.current) {
      const pos = pendingCursorRef.current;
      pendingCursorRef.current = null;
      inputRef.current.setSelectionRange(pos, pos);
    }
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const rawValue = input.value;
    const cursorPos = input.selectionStart ?? rawValue.length;

    // Count significant chars (digits + decimal sep) before the cursor.
    const beforeCursor = rawValue.slice(0, cursorPos);
    let sigBefore = 0;
    for (const ch of beforeCursor) {
      if (/\d/.test(ch) || ch === decimalSep) sigBefore++;
    }

    // Strip grouping separators and anything else except digits + decimal sep.
    const stripped = rawValue.replace(
      new RegExp(`[^\\d${escapeRegex(decimalSep)}]`, "g"),
      "",
    );

    // Prevent multiple decimal separators.
    const parts = stripped.split(decimalSep);
    if (parts.length > 2) return;

    // Cap decimal part to 2 digits.
    const significant =
      parts.length === 2
        ? `${parts[0]}${decimalSep}${parts[1].slice(0, 2)}`
        : stripped;

    // Format for display and compute numeric value.
    const formatted = formatSignificant(significant, decimalSep, locale);
    const numeric = parseSignificant(significant, decimalSep, groupSep);

    onChange(numeric);

    // Queue cursor restoration after next render.
    pendingCursorRef.current = formatted
      ? getNewCursorPosition(formatted, sigBefore, decimalSep)
      : 0;

    setDisplayValue(formatted);
  }

  function handleFocus() {
    setIsFocused(true);
  }

  function handleBlur() {
    setIsFocused(false);
    // On blur, fully format with 2 decimal places.
    setDisplayValue(numericToDisplay(value, locale));
  }

  return (
    <div
      className={`flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 ${className ?? ""}`}
    >
      <span className="shrink-0 select-none text-sm text-gray-400">{symbol}</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder ?? defaultPlaceholder}
        required={required}
        className="min-w-0 flex-1 bg-transparent text-base focus:outline-none"
      />
      {showSelector && (
        <select
          value={currency}
          onChange={(e) => onCurrencyChange?.(e.target.value)}
          className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {availableCurrencies!.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}
      {/* Hidden input carries the raw numeric value for server-action form submission. */}
      <input type="hidden" name={name} value={value > 0 ? value : ""} />
    </div>
  );
}
