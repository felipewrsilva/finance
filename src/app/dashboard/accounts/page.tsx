import { getAccounts } from "@/modules/accounts/actions";
import { AccountCard } from "@/components/accounts/account-card";
import { auth } from "@/auth";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import type { Account } from "@prisma/client";

export default async function AccountsPage() {
  const [accounts, session] = await Promise.all([getAccounts(), auth()]);
  const currency = session?.user?.defaultCurrency ?? "BRL";
  const locale = session?.user?.locale ?? "pt-BR";

  const totalBalance = accounts.reduce((sum: number, a: Account) => sum + Number(a.balance), 0);
  const formatted = formatCurrency(totalBalance, currency, locale);
  const accountCount = accounts.length === 1 ? "1 account" : `${accounts.length} accounts`;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title="Accounts"
        action={
          <a
            href="/dashboard/accounts/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            + New account
          </a>
        }
      />

      {/* Balance hero */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Total balance
        </p>
        <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-gray-900 sm:text-4xl">
          {formatted}
        </p>
        <p className="mt-1 text-xs text-gray-400">{accountCount}</p>
      </div>

      {/* Account list */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <p className="text-4xl mb-4" aria-hidden="true">🏦</p>
          <p className="text-base font-semibold text-gray-800">No accounts yet</p>
          <p className="mt-1.5 max-w-xs text-sm text-gray-400">
            Add your first account to start tracking your finances.
          </p>
          <a
            href="/dashboard/accounts/new"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Create your first account
          </a>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4" aria-label="Accounts" role="list">
          {accounts.map((account) => (
            <div key={account.id} role="listitem">
              <AccountCard
                account={{ ...account, balance: account.balance.toString() }}
                currency={currency}
                totalAccounts={accounts.length}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
