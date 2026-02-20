"use client";

import { useState, useRef, useEffect, useMemo } from "react";

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type ViewMode = "day" | "year";

// Computed once at module load — safe for a "use client" component.
const TODAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();
const CURRENT_YEAR = TODAY.getFullYear();
const YEAR_MIN = CURRENT_YEAR - 50;
const YEAR_MAX = CURRENT_YEAR + 20;
const YEARS = Array.from(
  { length: YEAR_MAX - YEAR_MIN + 1 },
  (_, i) => YEAR_MIN + i
);

interface DatePickerProps {
  name: string;
  /** ISO 8601 date string (YYYY-MM-DD) or empty string for no selection. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/** Parse an ISO YYYY-MM-DD string into a local Date (no time-zone shift). */
function parseISO(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3]);
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DatePicker({
  name,
  value,
  onChange,
  placeholder = "Select date",
  required,
  className,
}: DatePickerProps) {
  const selectedDate = value ? parseISO(value) : null;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  /** Working date while the calendar is open — committed on "Set". */
  const [draft, setDraft] = useState<Date | null>(selectedDate);
  const [viewYear, setViewYear] = useState(
    selectedDate?.getFullYear() ?? CURRENT_YEAR
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDate?.getMonth() ?? TODAY.getMonth()
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const yearGridRef = useRef<HTMLDivElement>(null);

  // Keep draft/view in sync when `value` is changed externally.
  useEffect(() => {
    const d = value ? parseISO(value) : null;
    setDraft(d);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Close on outside pointer-down.
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  // Escape: collapse year view first, then close picker.
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (viewMode === "year") {
          setViewMode("day");
        } else {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, viewMode]);

  // Scroll to the highlighted year whenever the year grid opens.
  useEffect(() => {
    if (viewMode !== "year" || !yearGridRef.current) return;
    const targetYear = draft ? draft.getFullYear() : CURRENT_YEAR;
    const el = yearGridRef.current.querySelector<HTMLElement>(
      `[data-year="${targetYear}"]`
    );
    if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
  }, [viewMode, draft]);

  function openPicker() {
    const d = value ? parseISO(value) : null;
    setDraft(d);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    } else {
      setViewYear(CURRENT_YEAR);
      setViewMonth(TODAY.getMonth());
    }
    setViewMode("day");
    setIsOpen(true);
  }

  function handleSet() {
    if (draft) onChange(toISO(draft));
    setIsOpen(false);
  }

  function handleClear() {
    onChange("");
    setIsOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectYear(year: number) {
    // Preserve current month; clamp day to valid range for the new year.
    if (draft) {
      const maxDay = new Date(year, draft.getMonth() + 1, 0).getDate();
      setDraft(new Date(year, draft.getMonth(), Math.min(draft.getDate(), maxDay)));
    }
    setViewYear(year);
    setViewMode("day");
  }

  // ── Calendar grid cells (memoized) ──────────────────────────────────────
  const cells = useMemo<(number | null)[]>(() => {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const arr: (number | null)[] = [
      ...Array<null>(firstDow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [viewYear, viewMonth]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en", { month: "long" }).format(
        new Date(viewYear, viewMonth, 1)
      ),
    [viewYear, viewMonth]
  );

  // ── Header display ───────────────────────────────────────────────────────
  const headerYear = draft ? draft.getFullYear() : viewYear;
  const headerFormatted = draft
    ? new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(draft)
    : `${monthLabel} ${viewYear}`;

  // ── Trigger label ────────────────────────────────────────────────────────
  const triggerLabel = selectedDate
    ? new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(selectedDate)
    : placeholder;

  return (
    <div
      ref={containerRef}
      className={`relative${className ? ` ${className}` : ""}`}
    >
      {/* Hidden input for server action / FormData submission. */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          selectedDate ? "text-gray-900" : "text-gray-400"
        }`}
      >
        <span>{triggerLabel}</span>
        {/* Calendar icon */}
        <svg
          className="h-4 w-4 shrink-0 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* ── Calendar popover ─────────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose date"
          className="absolute left-0 top-full z-50 mt-2 w-full min-w-72 max-w-sm rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          {/* ── Header — clicking year toggles year-selection mode ───────── */}
          <div className="border-b border-gray-100 px-5 pb-4 pt-5">
            <button
              type="button"
              onClick={() =>
                setViewMode(viewMode === "year" ? "day" : "year")
              }
              aria-label={
                viewMode === "year"
                  ? "Back to day view"
                  : `Select year, currently ${headerYear}`
              }
              className="group flex flex-col gap-0.5 text-left focus-visible:outline-none"
            >
              <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-gray-400 transition-colors group-hover:text-indigo-500">
                {headerYear}
                <svg
                  className={`h-3 w-3 transition-transform duration-150 ${
                    viewMode === "year" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
              <span className="text-xl font-semibold leading-tight text-gray-900">
                {headerFormatted}
              </span>
            </button>
          </div>

          {viewMode === "year" ? (
            /* ── Year selection grid ──────────────────────────────────────── */
            <div
              ref={yearGridRef}
              role="listbox"
              aria-label="Select year"
              className="h-64 overflow-y-auto px-4 py-3"
            >
              <div className="grid grid-cols-4 gap-1">
                {YEARS.map((year) => {
                  const isSelectedYear = draft
                    ? draft.getFullYear() === year
                    : false;
                  const isCurrentYear = year === CURRENT_YEAR;

                  return (
                    <button
                      key={year}
                      type="button"
                      role="option"
                      data-year={year}
                      aria-selected={isSelectedYear}
                      onClick={() => selectYear(year)}
                      className={`w-full rounded-lg py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
                        isSelectedYear
                          ? "bg-indigo-600 text-white"
                          : isCurrentYear
                          ? "border border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Day view ─────────────────────────────────────────────────── */
            <>
              {/* Month navigation */}
              <div className="flex items-center justify-between px-5 py-3">
                <button
                  type="button"
                  onClick={prevMonth}
                  aria-label="Previous month"
                  className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <span className="text-sm font-semibold text-gray-900">
                  {monthLabel} {viewYear}
                </span>

                <button
                  type="button"
                  onClick={nextMonth}
                  aria-label="Next month"
                  className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Calendar grid */}
              <div className="px-4 pb-3">
                {/* Day-name header row */}
                <div className="grid grid-cols-7 mb-1">
                  {DAY_NAMES.map((d) => (
                    <div
                      key={d}
                      className="flex items-center justify-center py-1"
                    >
                      <span className="text-xs font-medium text-gray-400">
                        {d}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div
                  role="grid"
                  aria-label={`${monthLabel} ${viewYear}`}
                  className="grid grid-cols-7 gap-y-1"
                >
                  {cells.map((day, idx) => {
                    if (!day)
                      return (
                        <div key={`e-${idx}`} role="gridcell" aria-hidden="true" />
                      );

                    const isSelected =
                      !!draft &&
                      draft.getFullYear() === viewYear &&
                      draft.getMonth() === viewMonth &&
                      draft.getDate() === day;

                    const isToday =
                      TODAY.getFullYear() === viewYear &&
                      TODAY.getMonth() === viewMonth &&
                      TODAY.getDate() === day;

                    return (
                      <div key={day} role="gridcell">
                        <button
                          type="button"
                          onClick={() =>
                            setDraft(new Date(viewYear, viewMonth, day))
                          }
                          aria-label={new Date(
                            viewYear,
                            viewMonth,
                            day
                          ).toDateString()}
                          aria-pressed={isSelected}
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
                            isSelected
                              ? "bg-indigo-600 font-semibold text-white"
                              : isToday
                              ? "border border-indigo-300 font-medium text-indigo-600 hover:bg-indigo-50"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {day}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              onClick={handleClear}
              className="rounded text-sm text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Clear
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSet}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
