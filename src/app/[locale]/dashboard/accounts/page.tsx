import { getAccounts } from "@/modules/accounts/actions";
import { AccountCard } from "@/components/accounts/account-card";
import { auth } from "@/auth";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { getTranslations } from "next-intl/server";
import type { Account } from "@prisma/client";

type Props = { params: Promise<{ locale: string }> };

export default async function AccountsPage({ params }: Props) {
  const { locale } = await params;
  const [accounts, session, t] = await Promise.all([
    getAccounts(),
    auth(),
    getTranslations("accounts"),
  ]);
  const currency = session?.user?.defaultCurrency ?? "BRL";
  const userLocale = session?.user?.locale ?? locale;

  const totalBalance = accounts.reduce((sum: number, a: Account) => sum + Number(a.balance), 0);
  const formatted = formatCurrency(totalBalance, currency, userLocale);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title={t("title")}
        action={
          <a
            href={`/${locale}/dashboard/accounts/new`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {t("newAccount")}
          </a>
        }
      />

      {/* Balance hero */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {t("totalBalanceLabel")}
        </p>
        <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-gray-900 sm:text-4xl">
          {formatted}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {t("accountCount", { count: accounts.length })}
        </p>
      </div>

      {/* Account list */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <p className="text-4xl mb-4" aria-hidden="true">🏦</p>
          <p className="text-base font-semibold text-gray-800">{t("emptyTitle")}</p>
          <p className="mt-1.5 max-w-xs text-sm text-gray-400">{t("emptySubtitle")}</p>
          <a
            href={`/${locale}/dashboard/accounts/new`}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {t("emptyCta")}
          </a>
        </div>
      ) : (
        <div
          className="grid gap-3 sm:grid-cols-2 sm:gap-4"
          aria-label={t("title")}
          role="list"
        >
          {accounts.map((account) => (
            <div key={account.id} role="listitem">
              <AccountCard
                account={{ ...account, balance: account.balance.toString() }}
                currency={currency}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
