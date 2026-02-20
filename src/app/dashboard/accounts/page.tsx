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

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        title="Accounts"
        subtitle={`Total balance: ${formatted}`}
        action={
          <a
            href="/dashboard/accounts/new"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + New account
          </a>
        }
      />

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-400">No accounts yet.</p>
          <a
            href="/dashboard/accounts/new"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            Add account
          </a>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={{ ...account, balance: account.balance.toString() }}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
}
