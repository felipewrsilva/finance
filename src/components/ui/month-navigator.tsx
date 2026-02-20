"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

interface MonthNavigatorProps {
  month: number; // 1-12
  year: number;
}

export function MonthNavigator({ month, year }: MonthNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("transactions");

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

  const monthName = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={prev}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        aria-label="Previous month"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <div className="min-w-[160px] text-center" aria-live="polite" aria-atomic="true">
        <p className="font-medium text-gray-900 capitalize">{monthName}</p>
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              navigate(now.getMonth() + 1, now.getFullYear());
            }}
            className="mt-0.5 text-xs text-indigo-500 hover:underline"
          >
            {t("backToToday")}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={next}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        aria-label="Next month"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
