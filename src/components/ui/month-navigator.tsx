"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MONTHS } from "@/modules/transactions/constants";

interface MonthNavigatorProps {
  month: number; // 1-12
  year: number;
}

export function MonthNavigator({ month, year }: MonthNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function navigate(newMonth: number, newYear: number) {
    const next = new URLSearchParams(params.toString());
    next.set("month", String(newMonth));
    next.set("year", String(newYear));
    router.push(`${pathname}?${next.toString()}`);
  }

  function prev() {
    if (month === 1) navigate(12, year - 1);
    else navigate(month - 1, year);
  }

  function next() {
    if (month === 12) navigate(1, year + 1);
    else navigate(month + 1, year);
  }

  const isCurrentMonth =
    month === new Date().getMonth() + 1 && year === new Date().getFullYear();

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={prev}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 text-xl font-light"
        aria-label="Previous month"
      >
        ‹
      </button>

      <div className="text-center" aria-live="polite" aria-atomic="true">
        <p className="font-semibold text-gray-900">
          {MONTHS[month - 1]} {year}
        </p>
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              navigate(now.getMonth() + 1, now.getFullYear());
            }}
            className="text-xs text-indigo-500 hover:underline"
          >
            Back to today
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={next}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 text-xl font-light"
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  );
}
