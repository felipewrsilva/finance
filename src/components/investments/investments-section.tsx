"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { InvestmentList } from "@/components/investments/investment-list";
import { InvestmentDialog } from "@/components/investments/investment-dialog";
import type { Investment, InvestmentCategory } from "@prisma/client";

type InvestmentWithCategory = Investment & { category: InvestmentCategory };

interface InvestmentsSectionProps {
  investments: InvestmentWithCategory[];
  categories: InvestmentCategory[];
  activeCount: number;
  currency: string;
  locale: string;
  userCurrencies?: string[];
  defaultCurrency?: string;
  stats?: React.ReactNode;
  footer?: React.ReactNode;
}

export function InvestmentsSection({
  investments,
  categories,
  activeCount,
  currency,
  locale,
  userCurrencies,
  defaultCurrency,
  stats,
  footer,
}: InvestmentsSectionProps) {
  const ti = useTranslations("investments");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InvestmentWithCategory | undefined>();

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(investment: InvestmentWithCategory) {
    setEditing(investment);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(undefined);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">{ti("title")}</h2>
          <p className="text-sm text-gray-500">
            {ti("activeInvestments", { count: activeCount })}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 active:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          {ti("addInvestment")}
        </button>
      </div>

      {stats}

      <InvestmentList
        investments={investments}
        currency={currency}
        locale={locale}
        onAdd={openCreate}
        onEdit={openEdit}
      />

      {footer}

      <InvestmentDialog
        open={dialogOpen}
        onClose={closeDialog}
        categories={categories}
        investment={editing}
        userCurrencies={userCurrencies}
        defaultCurrency={defaultCurrency}
        locale={locale}
      />
    </div>
  );
}
