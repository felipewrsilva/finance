"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { InvestmentForm } from "@/components/investments/investment-form";
import type { Investment, InvestmentCategory } from "@prisma/client";

type InvestmentWithCategory = Investment & { category: InvestmentCategory };

interface InvestmentDialogProps {
  open: boolean;
  onClose: () => void;
  categories: InvestmentCategory[];
  investment?: InvestmentWithCategory;
  userCurrencies?: string[];
  defaultCurrency?: string;
  locale?: string;
}

export function InvestmentDialog({
  open,
  onClose,
  categories,
  investment,
  userCurrencies,
  defaultCurrency,
  locale,
}: InvestmentDialogProps) {
  const t = useTranslations("investments");
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl outline-none sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            {investment ? t("editInvestment") : t("addInvestment")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <InvestmentForm
          categories={categories}
          investment={investment}
          userCurrencies={userCurrencies}
          defaultCurrency={defaultCurrency}
          locale={locale}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
